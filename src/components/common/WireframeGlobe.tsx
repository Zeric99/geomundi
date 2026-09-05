import React, { useEffect, useRef, useState, useMemo } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';

interface WireframeGlobeProps {
  className?: string;
  size?: number;
}

export const WireframeGlobe: React.FC<WireframeGlobeProps> = ({
  className = '',
  size = 640
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [landGeoJson, setLandGeoJson] = useState<any>(null);
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Pre-generar matriz esférica de puntos 3D (cada 10° lat/lon)
  const geoGridPoints = useMemo(() => {
    const points: [number, number][] = [];
    for (let lat = -80; lat <= 80; lat += 10) {
      for (let lon = -180; lon < 180; lon += 10) {
        points.push([lon, lat]);
      }
    }
    return points;
  }, []);

  // Pre-generar partículas de polvo estelar que flotan y se mueven lentamente por el fondo
  const ambientParticles = useRef(
    Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00008,
      vy: (Math.random() - 0.5) * 0.00008,
      radius: Math.random() * 1.6 + 0.6,
      baseOpacity: Math.random() * 0.5 + 0.15,
      pulseFreq: Math.random() * 0.002 + 0.001
    }))
  ).current;

  // Cargar datos de continentes (world-110m.json)
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

  // Animación del Canvas 2D
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
      .scale((canvasSize / 2) - 20)
      .translate([(canvasSize * dpr) / 2, (canvasSize * dpr) / 2])
      .clipAngle(90);

    const pathGenerator = geoPath().projection(projection).context(ctx);
    const graticule = geoGraticule10();
    const sphereFeature: any = { type: 'Sphere' };

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Rotación ultra-lenta (0.0018° por milisegundo = ~0.1° por segundo)
      rotationRef.current = (rotationRef.current + delta * 0.0018) % 360;
      const currentRot = rotationRef.current;

      projection.rotate([currentRot, -16, 0]);

      // Limpiar lienzo transparente
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 0. DIBUJAR PUNTOS Y PARTÍCULAS EN MOVIMIENTO POR TODO EL FONDO
      ambientParticles.forEach((p) => {
        // Mover partícula lentamente
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        // Rebote o reaparición continua al salir de bordes
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        const alphaPulse = Math.sin(time * p.pulseFreq) * 0.15;
        const currentOpacity = Math.max(0.08, Math.min(0.8, p.baseOpacity + alphaPulse));

        ctx.beginPath();
        ctx.arc(
          p.x * canvas.width,
          p.y * canvas.height,
          p.radius * dpr,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity.toFixed(3)})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 3 * dpr;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 1. Silueta / Sombrado sutil del globo
      ctx.beginPath();
      pathGenerator(sphereFeature);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
      ctx.fill();

      // 2. Anillo exterior nítido de la esfera
      ctx.beginPath();
      pathGenerator(sphereFeature);
      ctx.lineWidth = 1.35 * dpr;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.stroke();

      // 3. Malla geométrica de paralelos y meridianos (Graticule)
      ctx.beginPath();
      pathGenerator(graticule);
      ctx.lineWidth = 0.7 * dpr;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.setLineDash([2 * dpr, 4 * dpr]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Malla vectorial nítida de Continentes
      if (landGeoJson) {
        ctx.beginPath();
        pathGenerator(landGeoJson);
        ctx.lineWidth = 1.3 * dpr;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 9 * dpr;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 5. Matriz de puntitos luminosos en 3D sobre la cara frontal del globo
      const centerLon = -currentRot;
      const centerLat = 16;

      geoGridPoints.forEach(([lon, lat]) => {
        const dist = geoDistance([lon, lat], [centerLon, centerLat]);
        if (dist < Math.PI / 2) {
          const pt = projection([lon, lat]);
          if (pt) {
            const alpha = Math.pow(Math.cos(dist), 1.1) * 0.75;
            if (alpha > 0.03) {
              ctx.beginPath();
              ctx.arc(pt[0], pt[1], 1.3 * dpr, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
              ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
              ctx.shadowBlur = 3 * dpr;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      });

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
  }, [landGeoJson, size, geoGridPoints, ambientParticles]);

  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
      {/* Resplandor radial de fondo */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-white/5 to-transparent blur-3xl" 
        style={{ transform: 'scale(0.9)' }}
      />

      <canvas
        ref={canvasRef}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: '100%',
        }}
        className="relative z-10 opacity-100 transition-opacity duration-500"
      />
    </div>
  );
};
