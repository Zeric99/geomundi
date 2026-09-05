import React, { useEffect, useRef, useState } from 'react';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';

interface WireframeGlobeProps {
  className?: string;
  size?: number;
}

export const WireframeGlobe: React.FC<WireframeGlobeProps> = ({
  className = '',
  size = 560
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [landGeoJson, setLandGeoJson] = useState<any>(null);
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

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

  // Animación de rotación del globo en Canvas 2D
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

      // Rotación lenta y fluida (aprox. 0.015 grados por milisegundo => 0.9°/segundo)
      rotationRef.current = (rotationRef.current + delta * 0.015) % 360;

      projection.rotate([rotationRef.current, -18, 0]);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Fondo sutil de la esfera (silueta sombreada translúcida)
      ctx.beginPath();
      pathGenerator(sphereFeature);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fill();

      // 2. Borde exterior de la esfera
      ctx.beginPath();
      pathGenerator(sphereFeature);
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.stroke();

      // 3. Malla geométrica de paralelos y meridianos (Graticule)
      ctx.beginPath();
      pathGenerator(graticule);
      ctx.lineWidth = 0.6 * dpr;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.setLineDash([2 * dpr, 4 * dpr]); // Estilo de línea punteada/geométrica
      ctx.stroke();
      ctx.setLineDash([]); // Restablecer a línea continua

      // 4. Malla vectorial de Continentes
      if (landGeoJson) {
        // Trazado de líneas continentales
        ctx.beginPath();
        pathGenerator(landGeoJson);
        ctx.lineWidth = 1.1 * dpr;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.25)';
        ctx.shadowBlur = 6 * dpr;
        ctx.stroke();
        ctx.shadowBlur = 0; // Desactivar glow para siguientes capas
      }

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
  }, [landGeoJson, size]);

  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
      {/* Resplandor radial de fondo sutil */}
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
        className="relative z-10 opacity-80 mix-blend-screen transition-opacity duration-1000"
      />
    </div>
  );
};
