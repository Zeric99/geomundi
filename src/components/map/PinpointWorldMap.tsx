import React, { useState, useEffect, useRef, useCallback } from 'react';
import { geoOrthographic, geoEqualEarth, geoPath, geoGraticule10, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import { Crosshair, Globe, Map as MapIcon, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import topoData from '../../data/world-110m.json';

interface PinpointWorldMapProps {
  clickedCoords: [number, number] | null; // [lng, lat]
  targetCoords: [number, number] | null;  // [lng, lat]
  onMapClick: (coords: [number, number]) => void;
  isEvaluated: boolean;
  continent?: string;
  cityName?: string;
}

// Convertir TopoJSON pre-cargado a GeoJSON en memoria (Instantáneo, 0ms latencia)
const landFeatures = feature(topoData as any, topoData.objects.land as any);
const countriesFeatures = feature(topoData as any, topoData.objects.countries as any);

export const PinpointWorldMap: React.FC<PinpointWorldMapProps> = ({
  clickedCoords,
  targetCoords,
  onMapClick,
  isEvaluated,
  continent = 'World'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Modo de visualización: 'globe' (Esfera 3D) o 'flat' (Mapa Plano)
  const [mapMode, setMapMode] = useState<'globe' | 'flat'>('globe');

  // Estado de Rotación y Zoom
  const rotationRef = useRef<[number, number]>([0, -15]); // [rotX (lng), rotY (lat)]
  const targetRotationRef = useRef<[number, number]>([0, -15]);
  const zoomScaleRef = useRef<number>(1.0);
  const targetZoomScaleRef = useRef<number>(1.0);

  // Control de Arrastre (Mouse / Touch Drag)
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStartRef = useRef<[number, number]>([0, -15]);
  const totalDragDistRef = useRef<number>(0);
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);

  // Centrar cámara suavemente en el objetivo cuando se evalúa la ronda
  useEffect(() => {
    if (isEvaluated && targetCoords) {
      if (clickedCoords) {
        // Rotar hacia el punto medio entre el clic del usuario y la ciudad objetivo
        let midLng = (clickedCoords[0] + targetCoords[0]) / 2;
        if (Math.abs(clickedCoords[0] - targetCoords[0]) > 180) {
          midLng = midLng + 180;
        }
        const midLat = (clickedCoords[1] + targetCoords[1]) / 2;
        targetRotationRef.current = [-midLng, -midLat];
      } else {
        targetRotationRef.current = [-targetCoords[0], -targetCoords[1]];
      }
    }
  }, [isEvaluated, targetCoords, clickedCoords]);

  // Controles de Zoom manual
  const handleZoomIn = () => {
    targetZoomScaleRef.current = Math.min(targetZoomScaleRef.current * 1.35, 4.5);
  };

  const handleZoomOut = () => {
    targetZoomScaleRef.current = Math.max(targetZoomScaleRef.current / 1.35, 0.6);
  };

  const handleResetView = () => {
    targetRotationRef.current = [0, -15];
    targetZoomScaleRef.current = 1.0;
  };

  // Manejo de rueda del ratón (Wheel Zoom)
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.15 : 0.87;
    targetZoomScaleRef.current = Math.max(0.6, Math.min(4.5, targetZoomScaleRef.current * delta));
  }, []);

  // Eventos de Puntero (Pointer Down / Move / Up)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    rotationStartRef.current = [...rotationRef.current];
    totalDragDistRef.current = 0;
    setIsDraggingState(false);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const dx = e.clientX - pointerStartPosRef.current.x;
    const dy = e.clientY - pointerStartPosRef.current.y;
    totalDragDistRef.current = Math.sqrt(dx * dx + dy * dy);

    if (totalDragDistRef.current > 4) {
      setIsDraggingState(true);
    }

    const sensitivity = 0.35 / zoomScaleRef.current;
    // Movimiento físico natural del globo:
    // Arrastrar hacia abajo (dy > 0) desplaza la superficie hacia abajo (viendo el Hemisferio Norte).
    const newRotX = rotationStartRef.current[0] + dx * sensitivity;
    const newRotY = Math.max(-85, Math.min(85, rotationStartRef.current[1] - dy * sensitivity));

    rotationRef.current = [newRotX, newRotY];
    targetRotationRef.current = [newRotX, newRotY];
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const isClick = totalDragDistRef.current < 6;
    isPointerDownRef.current = false;
    setIsDraggingState(false);

    if (isClick && !isEvaluated && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      // Calcular proyección exacta para la inversión D3
      const minDim = Math.min(width, height);
      const baseRadius = mapMode === 'globe' ? (minDim / 2) * 0.85 : (minDim / 2) * 0.95;
      const currentRadius = baseRadius * zoomScaleRef.current;
      const cx = width / 2;
      const cy = height / 2;

      let projection;
      if (mapMode === 'globe') {
        projection = geoOrthographic()
          .scale(currentRadius)
          .translate([cx, cy])
          .rotate([rotationRef.current[0], rotationRef.current[1], 0])
          .clipAngle(90);

        // Verificar que el clic ocurrió dentro de la esfera visible
        const distFromCenter = Math.sqrt((clickX - cx) ** 2 + (clickY - cy) ** 2);
        if (distFromCenter > currentRadius) return;
      } else {
        projection = geoEqualEarth()
          .scale(currentRadius)
          .translate([cx, cy])
          .rotate([rotationRef.current[0], 0, 0]);
      }

      const coords = projection.invert ? projection.invert([clickX, clickY]) : null;

      if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
        // En modo esfera, comprobar si las coordenadas están en el hemisferio frontal visible
        if (mapMode === 'globe') {
          const centerLngLat: [number, number] = [-rotationRef.current[0], -rotationRef.current[1]];
          const distAngle = geoDistance(coords, centerLngLat);
          if (distAngle > Math.PI / 2 + 0.05) return; // Detrás de la Tierra
        }

        // Ejecutar tiro directo al hacer clic en el mapa / esfera sin confirmación previa
        onMapClick([coords[0], coords[1]]);
      }
    }
  }, [isEvaluated, mapMode, onMapClick]);

  // Bucle de Animación y Renderizado del Canvas 2D
  useEffect(() => {
    let animFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Interpolación suave (lerp) de rotación y zoom
      rotationRef.current[0] += (targetRotationRef.current[0] - rotationRef.current[0]) * 0.15;
      rotationRef.current[1] += (targetRotationRef.current[1] - rotationRef.current[1]) * 0.15;
      zoomScaleRef.current += (targetZoomScaleRef.current - zoomScaleRef.current) * 0.15;

      const rot = rotationRef.current;
      const zoom = zoomScaleRef.current;

      const minDim = Math.min(width, height);
      const baseRadius = mapMode === 'globe' ? (minDim / 2) * 0.85 : (minDim / 2) * 0.95;
      const radius = baseRadius * zoom;
      const cx = width / 2;
      const cy = height / 2;

      // Configurar proyección D3
      let projection;
      if (mapMode === 'globe') {
        projection = geoOrthographic()
          .scale(radius)
          .translate([cx, cy])
          .rotate([rot[0], rot[1], 0])
          .clipAngle(90);
      } else {
        projection = geoEqualEarth()
          .scale(radius)
          .translate([cx, cy])
          .rotate([rot[0], 0, 0]);
      }

      const pathGenerator = geoPath().projection(projection).context(ctx);
      const graticule = geoGraticule10();

      // 1. Fondo del Globo / Océanos
      if (mapMode === 'globe') {
        // Resplandor de la atmósfera exterior
        const atmosphereGrad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.15);
        atmosphereGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        atmosphereGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
        atmosphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = atmosphereGrad;
        ctx.fill();

        // Esfera Oceánica
        const oceanGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
        oceanGrad.addColorStop(0, '#102236');
        oceanGrad.addColorStop(0.7, '#0b1624');
        oceanGrad.addColorStop(1, '#060d16');

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = oceanGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 2. Grilla de Coordenadas (Graticule)
      ctx.beginPath();
      pathGenerator(graticule);
      ctx.strokeStyle = mapMode === 'globe' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 3. Continentes y Países
      if (landFeatures) {
        ctx.beginPath();
        pathGenerator(landFeatures);
        ctx.fillStyle = '#1c2d42';
        ctx.fill();
      }

      if (countriesFeatures) {
        ctx.beginPath();
        pathGenerator(countriesFeatures);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Función auxiliar para comprobar visibilidad en el frente del globo
      const isVisibleOnFront = (coords: [number, number]): boolean => {
        if (mapMode === 'flat') return true;
        const center: [number, number] = [-rot[0], -rot[1]];
        return geoDistance(coords, center) < Math.PI / 2 - 0.02;
      };

      // 4. Línea de Arco Conector entre Clic del Usuario y Destino
      if (isEvaluated && clickedCoords && targetCoords) {
        const arcGeoJson: any = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [clickedCoords, targetCoords]
          }
        };

        ctx.save();
        ctx.beginPath();
        pathGenerator(arcGeoJson);
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Marcador del Clic del Usuario (Crosshair Táctico)
      if (clickedCoords && isVisibleOnFront(clickedCoords)) {
        const pt = projection(clickedCoords);
        if (pt) {
          const [px, py] = pt;

          ctx.save();
          // Halo de pulso
          ctx.beginPath();
          ctx.arc(px, py, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Círculo central
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();

          // Retícula de mira
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px - 18, py); ctx.lineTo(px - 9, py);
          ctx.moveTo(px + 9, py); ctx.lineTo(px + 18, py);
          ctx.moveTo(px, py - 18); ctx.lineTo(px, py - 9);
          ctx.moveTo(px, py + 9); ctx.lineTo(px, py + 18);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 6. Marcador de la Ciudad Objetivo (Baliza Neón Verde / Emerald)
      if (targetCoords && isEvaluated && isVisibleOnFront(targetCoords)) {
        const pt = projection(targetCoords);
        if (pt) {
          const [tx, ty] = pt;

          ctx.save();
          // Halo resplandeciente
          const glowGrad = ctx.createRadialGradient(tx, ty, 2, tx, ty, 22);
          glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.95)');
          glowGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.45)');
          glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

          ctx.beginPath();
          ctx.arc(tx, ty, 22, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          // Punto de la baliza
          ctx.beginPath();
          ctx.arc(tx, ty, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [mapMode, isEvaluated, clickedCoords, targetCoords]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full bg-[#080d14] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 select-none touch-none ${
        isDraggingState ? 'cursor-grabbing' : 'cursor-crosshair'
      }`}
    >
      {/* Lienzo Canvas 2D de Alta Definición */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Indicador de ayuda superior */}
      <div className="absolute top-3 left-3 z-10 bg-zinc-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2 shadow-xl pointer-events-none">
        <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>
          {isEvaluated
            ? 'Resultado evaluado. Haz clic en "Siguiente Ciudad" para continuar.'
            : mapMode === 'globe'
            ? 'Arrastra para girar el globo 3D y haz clic directo sobre la ubicación exacta.'
            : 'Haz clic directo en el mapa plano sobre la ciudad.'}
        </span>
      </div>

      {/* Selector de Modo (Esfera 3D / Mapa Plano) + Controles de Zoom */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Toggle Esfera / Mapa Plano */}
        <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-1 rounded-xl flex items-center shadow-xl">
          <button
            type="button"
            onClick={() => setMapMode('globe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapMode === 'globe'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Ver Esfera 3D Interactiva"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Esfera 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setMapMode('flat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapMode === 'flat'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Ver Mapa Plano 2D"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mapa Plano</span>
          </button>
        </div>

        {/* Botones de Zoom y Recentrar */}
        <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-1 rounded-xl flex items-center gap-1 shadow-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
            title="Acercar Zoom (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
            title="Alejar Zoom (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all active:scale-95 border-l border-zinc-800 pl-2"
            title="Restablecer Vista"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
