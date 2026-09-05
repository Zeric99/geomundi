import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import { Crosshair, Globe, Map as MapIcon, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import topoData from '../../data/world-110m.json';

export interface PinHistoryItem {
  clickedCoords: [number, number];
  targetCoords: [number, number];
  distanceKm?: number;
  score?: number;
  cityName?: string;
}

interface PinpointWorldMapProps {
  clickedCoords: [number, number] | null; // [lng, lat]
  targetCoords: [number, number] | null;  // [lng, lat]
  onMapClick: (coords: [number, number]) => void;
  isEvaluated: boolean;
  previousPins?: PinHistoryItem[];
  continent?: string;
  cityName?: string;
}

// Extraer continentes en memoria
const landFeatures = feature(topoData as any, topoData.objects.land as any);

/**
 * Genera una textura equirrectangular satelital realista de la Tierra (2048x1024) en Canvas 2D
 * con océanos azules, vegetación verde, desiertos dorados y casquetes polares sin NINGUNA línea de frontera.
 */
function generateSatelliteEarthTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Océano Profundo
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#091c30');
  oceanGrad.addColorStop(0.3, '#0e2b4a');
  oceanGrad.addColorStop(0.5, '#0c2744');
  oceanGrad.addColorStop(0.7, '#0c243e');
  oceanGrad.addColorStop(1, '#061322');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Renderizar polígonos de masa terrestre sin líneas de fronteras
  if (landFeatures && (landFeatures as any).features) {
    const scaleX = 2048 / 360;
    const scaleY = 1024 / 180;

    const projectPoint = (lng: number, lat: number): [number, number] => {
      const x = (lng + 180) * scaleX;
      const y = (90 - lat) * scaleY;
      return [x, y];
    };

    const drawPolygon = (ring: number[][]) => {
      if (!ring || ring.length < 3) return;
      ctx.beginPath();
      const [firstX, firstY] = projectPoint(ring[0][0], ring[0][1]);
      ctx.moveTo(firstX, firstY);
      for (let i = 1; i < ring.length; i++) {
        const [px, py] = projectPoint(ring[i][0], ring[i][1]);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    (landFeatures as any).features.forEach((feat: any) => {
      const geom = feat.geometry;
      if (!geom) return;

      const fillPolygonGeometry = (polygons: any[]) => {
        polygons.forEach((poly: any) => {
          if (!poly || poly.length === 0) return;
          const outerRing: number[][] = Array.isArray(poly[0]?.[0]) ? poly[0] : poly;

          // Calcular latitud media para gradientes biogeográficos
          let sumLat = 0;
          outerRing.forEach((pt: number[]) => { sumLat += pt[1]; });
          const avgLat = sumLat / outerRing.length;
          let sumLng = 0;
          outerRing.forEach((pt: number[]) => { sumLng += pt[0]; });
          const avgLng = sumLng / outerRing.length;

          // Color biogeográfico realista
          let landColor = '#244828'; // Verde templado

          const absLat = Math.abs(avgLat);
          if (absLat > 60) {
            landColor = '#dbeafe'; // Hielo y nieve polar
          } else if (avgLat > 12 && avgLat < 35 && avgLng > -18 && avgLng < 65) {
            landColor = '#b89458'; // Sahara / Arabia
          } else if (avgLat > 35 && avgLat < 48 && avgLng > 55 && avgLng < 105) {
            landColor = '#a8894f'; // Desierto de Gobi / Asia Central
          } else if (avgLat > -32 && avgLat < -18 && avgLng > 112 && avgLng < 154) {
            landColor = '#bc7c47'; // Outback de Australia
          } else if (absLat < 15) {
            landColor = '#173d1f'; // Selva Amazónica / Congo
          } else if (absLat >= 15 && absLat <= 38) {
            landColor = '#32592c'; // Sabanas y zonas subtropicales
          }

          ctx.fillStyle = landColor;
          drawPolygon(outerRing);
          ctx.fill();
        });
      };

      if (geom.type === 'Polygon') {
        fillPolygonGeometry([geom.coordinates]);
      } else if (geom.type === 'MultiPolygon') {
        fillPolygonGeometry(geom.coordinates);
      }
    });
  }

  // 3. Casquetes Polares
  const northIce = ctx.createLinearGradient(0, 0, 0, 100);
  northIce.addColorStop(0, '#f8fafc');
  northIce.addColorStop(1, 'rgba(248, 250, 252, 0)');
  ctx.fillStyle = northIce;
  ctx.fillRect(0, 0, 2048, 100);

  const southIce = ctx.createLinearGradient(0, 920, 0, 1024);
  southIce.addColorStop(0, 'rgba(248, 250, 252, 0)');
  southIce.addColorStop(1, '#f8fafc');
  ctx.fillStyle = southIce;
  ctx.fillRect(0, 920, 2048, 104);

  return canvas;
}

export const PinpointWorldMap: React.FC<PinpointWorldMapProps> = ({
  clickedCoords,
  targetCoords,
  onMapClick,
  isEvaluated,
  previousPins = []
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Referencias Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);

  // Rotación y Zoom target (yaw: rotación Y, pitch: inclinación X)
  const rotationRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const targetRotationRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const zoomScaleRef = useRef<number>(1.0);
  const targetZoomScaleRef = useRef<number>(1.0);

  // Arrastre con ratón / touch
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStartRef = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const dragDistRef = useRef<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Convertir [lng, lat] a Vector3 3D exacto en la esfera Three.js
  const lngLatToVector3 = useCallback((lng: number, lat: number, radius: number = 1.01): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = - radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(theta) * Math.sin(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Convertir Vector3 3D local a [lng, lat] exactos
  const vector3ToLngLat = useCallback((vector: THREE.Vector3): [number, number] => {
    const norm = vector.clone().normalize();
    const clampedY = Math.max(-1, Math.min(1, norm.y));
    const lat = 90 - Math.acos(clampedY) * (180 / Math.PI);
    let lng = Math.atan2(norm.z, -norm.x) * (180 / Math.PI) - 180;
    if (lng < -180) lng += 360;
    if (lng > 180) lng -= 360;
    return [lng, lat];
  }, []);

  // Inicializar Escena Three.js 3D
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Escena
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Cámara
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.5);
    cameraRef.current = camera;

    // 3. Renderer WebGL
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // 5. Textura Satelital
    const procCanvas = generateSatelliteEarthTexture();
    const earthTexture = new THREE.CanvasTexture(procCanvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    // Textura fotográfica NASA de alta resolución si está disponible
    const loader = new THREE.TextureLoader();
    loader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg',
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        if (earthMeshRef.current) {
          (earthMeshRef.current.material as THREE.MeshStandardMaterial).map = loadedTex;
          (earthMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      },
      undefined,
      () => {}
    );

    // 6. Malla Esférica de la Tierra (Orden de Rotación YXZ)
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.1
    });

    const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    earthMesh.rotation.order = 'YXZ';
    earthMeshRef.current = earthMesh;
    scene.add(earthMesh);

    // 7. Resplandor atmosférico
    const atmosGeometry = new THREE.SphereGeometry(1.03, 64, 64);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.15
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosMesh);

    // Bucle de Animación a 60fps
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      // Lerp suave de rotación yaw/pitch y zoom
      rotationRef.current.yaw += (targetRotationRef.current.yaw - rotationRef.current.yaw) * 0.12;
      rotationRef.current.pitch += (targetRotationRef.current.pitch - rotationRef.current.pitch) * 0.12;
      zoomScaleRef.current += (targetZoomScaleRef.current - zoomScaleRef.current) * 0.12;

      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.order = 'YXZ';
        earthMeshRef.current.rotation.y = rotationRef.current.yaw;
        earthMeshRef.current.rotation.x = rotationRef.current.pitch;
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = 3.5 / zoomScaleRef.current;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Renderizar Marcadores y Arcos 3D (Rondas anteriores + Ronda activa)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (markersGroupRef.current) {
      scene.remove(markersGroupRef.current);
      markersGroupRef.current = null;
    }

    const group = new THREE.Group();

    const drawPinAndArc = (
      userCoords: [number, number],
      tCoords: [number, number],
      isHistorical: boolean = false
    ) => {
      // 1. Marcador del tiro del usuario (Mira Cian 3D)
      const userPos = lngLatToVector3(userCoords[0], userCoords[1], 1.01);
      const pinGeo = new THREE.SphereGeometry(isHistorical ? 0.02 : 0.025, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: isHistorical ? 0x0891b2 : 0x06b6d4 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(userPos);
      group.add(pinMesh);

      const ringGeo = new THREE.RingGeometry(0.025, 0.04, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: isHistorical ? 0x0891b2 : 0x22d3ee, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(userPos);
      ringMesh.lookAt(userPos.clone().multiplyScalar(2));
      group.add(ringMesh);

      // 2. Marcador del objetivo real (Baliza Esmeralda 3D)
      const targetPos = lngLatToVector3(tCoords[0], tCoords[1], 1.01);
      const tPinGeo = new THREE.SphereGeometry(isHistorical ? 0.025 : 0.03, 16, 16);
      const tPinMat = new THREE.MeshBasicMaterial({ color: isHistorical ? 0x059669 : 0x10b981 });
      const tPinMesh = new THREE.Mesh(tPinGeo, tPinMat);
      tPinMesh.position.copy(targetPos);
      group.add(tPinMesh);

      // 3. Arco Neón 3D
      const points: THREE.Vector3[] = [];
      const numPoints = 40;
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const p = new THREE.Vector3().lerpVectors(userPos, targetPos, t);
        const dist = userPos.distanceTo(targetPos);
        const altitude = Math.sin(t * Math.PI) * (dist * 0.25);
        p.normalize().multiplyScalar(1.01 + altitude);
        points.push(p);
      }

      const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const arcMaterial = new THREE.LineBasicMaterial({
        color: isHistorical ? 0x0891b2 : 0x22d3ee,
        linewidth: isHistorical ? 1 : 3
      });
      const arcLine = new THREE.Line(arcGeometry, arcMaterial);
      group.add(arcLine);
    };

    // A. Dibujar pines históricos de rondas anteriores
    if (previousPins && previousPins.length > 0) {
      previousPins.forEach(item => {
        drawPinAndArc(item.clickedCoords, item.targetCoords, true);
      });

      // Centrar suavemente en el último tiro registrado
      const lastPin = previousPins[previousPins.length - 1];
      let midLng = (lastPin.clickedCoords[0] + lastPin.targetCoords[0]) / 2;
      if (Math.abs(lastPin.clickedCoords[0] - lastPin.targetCoords[0]) > 180) {
        midLng += 180;
        if (midLng > 180) midLng -= 360;
      }
      const midLat = (lastPin.clickedCoords[1] + lastPin.targetCoords[1]) / 2;

      const rotY = - (midLng + 90) * (Math.PI / 180);
      const rotX = midLat * (Math.PI / 180);
      targetRotationRef.current = { yaw: rotY, pitch: rotX };
    }

    // B. Dibujar tiro de la ronda activa si está evaluada
    if (clickedCoords && targetCoords && isEvaluated) {
      drawPinAndArc(clickedCoords, targetCoords, false);

      let midLng = (clickedCoords[0] + targetCoords[0]) / 2;
      if (Math.abs(clickedCoords[0] - targetCoords[0]) > 180) {
        midLng += 180;
        if (midLng > 180) midLng -= 360;
      }
      const midLat = (clickedCoords[1] + targetCoords[1]) / 2;

      const rotY = - (midLng + 90) * (Math.PI / 180);
      const rotX = midLat * (Math.PI / 180);
      targetRotationRef.current = { yaw: rotY, pitch: rotX };
    } else if (clickedCoords && !isEvaluated) {
      // Tiro individual en progreso
      const userPos = lngLatToVector3(clickedCoords[0], clickedCoords[1], 1.01);
      const pinGeo = new THREE.SphereGeometry(0.025, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(userPos);
      group.add(pinMesh);
    }

    markersGroupRef.current = group;
    scene.add(group);
  }, [clickedCoords, targetCoords, isEvaluated, previousPins, lngLatToVector3]);

  // Controles de zoom y reseteo
  const handleZoomIn = () => {
    targetZoomScaleRef.current = Math.min(targetZoomScaleRef.current * 1.35, 4.0);
  };

  const handleZoomOut = () => {
    targetZoomScaleRef.current = Math.max(targetZoomScaleRef.current / 1.35, 0.6);
  };

  const handleResetView = () => {
    targetRotationRef.current = { yaw: 0, pitch: 0 };
    targetZoomScaleRef.current = 1.0;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.15 : 0.87;
    targetZoomScaleRef.current = Math.max(0.6, Math.min(4.0, targetZoomScaleRef.current * delta));
  };

  // Arrastre físico exacto 1:1 de MapTap.gg
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    rotationStartRef.current = { ...rotationRef.current };
    dragDistRef.current = 0;
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    dragDistRef.current = Math.sqrt(dx * dx + dy * dy);

    if (dragDistRef.current > 4) {
      setIsDragging(true);
    }

    const sensitivity = 0.0045 / zoomScaleRef.current;
    
    // Arrastre 1:1 idéntico a MapTap.gg:
    // Mover ratón a la derecha (dx > 0) desplaza la superficie bajo el cursor a la derecha.
    // Mover ratón hacia abajo (dy > 0) desplaza la superficie bajo el cursor hacia abajo.
    const newYaw = rotationStartRef.current.yaw - dx * sensitivity;
    const newPitch = Math.max(-1.4, Math.min(1.4, rotationStartRef.current.pitch + dy * sensitivity));

    rotationRef.current = { yaw: newYaw, pitch: newPitch };
    targetRotationRef.current = { yaw: newYaw, pitch: newPitch };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const isClick = dragDistRef.current < 6;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (isClick && !isEvaluated && mountRef.current && cameraRef.current && earthMeshRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Raycasting 3D exacto sobre la esfera rotada
      const mouse = new THREE.Vector2(
        (clickX / rect.width) * 2 - 1,
        -(clickY / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObject(earthMeshRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const localPoint = earthMeshRef.current.worldToLocal(point.clone());
        const [lng, lat] = vector3ToLngLat(localPoint);

        onMapClick([lng, lat]);
      }
    }
  };

  return (
    <div
      ref={mountRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full bg-[#050b14] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 select-none touch-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
      }`}
    >
      {/* Indicador de ayuda superior */}
      <div className="absolute top-3 left-3 z-10 bg-zinc-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2 shadow-xl pointer-events-none">
        <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>
          {isEvaluated
            ? 'Resultado evaluado. Avanzando a la siguiente ubicación...'
            : 'Arrastra para girar la Esfera 3D y haz clic directo sobre la ciudad.'}
        </span>
      </div>

      {/* Selector y Controles de Zoom */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
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
