import React, { useEffect, useRef, useState, useMemo } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';

interface WireframeGlobeProps {
  className?: string;
  size?: number;
}

export const WireframeGlobe: React.FC<WireframeGlobeProps> = ({
  className = '',
  size = 580
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [landGeoJson, setLandGeoJson] = useState<any>(null);
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Pre-generar puntos de rejilla lat/lon para los nodos del mapa (cada 12.5°)
  const geoGridPoints = useMemo(() => {
    const points: [number, number][] = [];
    for (let lat = -75; lat <= 75; lat += 12.5) {
      for (let lon = -180; lon < 180; lon += 12.5) {
        points.push([lon, lat]);
      }
    }
    return points;
  }, []);

  // Pre-generar partículas ambientales flotantes (puntitos de constelación de fondo)
  const ambientDots = useMemo(() => {
    return Array.from({ length: 55 }, () => ({
      xRatio: Math.random(),
      yRatio: Math.random(),
      size: Math.random() * 1.4 + 0.6,
      opacity: Math.random() * 0.45 + 0.1,
      pulseSpeed: Math.random() * 0.002 + 0.001
    }));
  }, []);

  // Cargar topojson simplificado de baja poligonización (world-110m.json)
  useEffect(() => {
    let isMounted = true;
    const fetchGeoData = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const res = await fetch(`${baseUrl}data/world-110m.json`);
        if (!res.ok) return;
        const topoData = await res.json();
        if (topoData && topoData.objects && topoData.objects.land) {
          const landFeatures = feature(topoData, topoData.objects.land);
          if (isMounted) {
            setLandGeoJson(landFeatures);
          }
        }
      } catch (err) {
        console.error('Error cargando geometría del globo wireframe:', err);
      }
    };

    fetchGeoData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Animación de rotación ultra-lenta del globo en Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasSize = size;

    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;

    const projection = geoOrthographic()
      .scale((canvasSize / 2) - 25)
      .translate([(canvasSize * dpr) / 2, (canvasSize * dpr) / 2])
      .clipAngle(90);

    const pathGenerator = geoPath().projection(projection).context(ctx);
    const graticule = geoGraticule10();
    const sphereFeature: any = { type: 'Sphere' };

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Rotación ultra-lenta y serena (0.005°/ms => ~0.3°/segundo)
      rotationRef.current = (rotationRef.current + delta * 0.005) % 360;
      const currentRot = rotationRef.current;

      projection.rotate([currentRot, -16, 0]);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 0. Puntitos ambientales flotantes (constelación de fondo)
      ambientDots.forEach((dot) => {
        const pulse = Math.sin(time * dot.pulseSpeed) * 0.15;
        ctx.beginPath();
        ctx.arc(
          dot.xRatio * canvas.width,
          dot.yRatio * canvas.height,
          dot.size * dpr,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, dot.opacity + pulse)})`;
        ctx.fill();
      });

      // 1. Fondo de la esfera
      ctx.beginPath();
      pathGenerator(sphereFeature);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
      ctx.fill();

      // 2. Borde exterior de la esfera
      ctx.beginPath();
      pathGenerator(sphereFeature);
      ctx.lineWidth = 1.1 * dpr;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      // 3. Malla geométrica de paralelos y meridianos (Graticule)
      ctx.beginPath();
      pathGenerator(graticule);
      ctx.lineWidth = 0.55 * dpr;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.setLineDash([2 * dpr, 4 * dpr]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Malla vectorial de Continentes
      if (landGeoJson) {
        ctx.beginPath();
        pathGenerator(landGeoJson);
        ctx.lineWidth = 1.1 * dpr;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 5 * dpr;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 5. Puntitos ordenados sobre los nodos de la esfera (Matriz de puntos 3D)
      const centerLon = -currentRot;
      const centerLat = 16;

      geoGridPoints.forEach(([lon, lat]) => {
        const dist = geoDistance([lon, lat], [centerLon, centerLat]);
        if (dist < Math.PI / 2) {
          const pt = projection([lon, lat]);
          if (pt) {
            // Desvanecimiento esférico 3D progresivo hacia los bordes
            const alpha = Math.pow(Math.cos(dist), 1.5) * 0.45;
            if (alpha > 0.02) {
              ctx.beginPath();
              ctx.arc(pt[0], pt[1], 1.15 * dpr, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
              ctx.fill();
            }
          }
        }
      });

      // Continuar loop si la pestaña está activa
      if (!document.hidden) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      } else {
        lastTime = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [landGeoJson, size, geoGridPoints, ambientDots]);

  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
      {/* Resplandor radial sutil de fondo */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/5 via-white/5 to-transparent blur-3xl" 
        style={{ transform: 'scale(0.85)' }}
      />

      <canvas
        ref={canvasRef}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: '100%',
        }}
        className="relative z-10 opacity-85 mix-blend-screen transition-opacity duration-1000"
      />
    </div>
  );
};
