import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
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
      if (ring.length < 3) return;
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

          // Calcular latitud media para gradientes biogeográficos (Desiertos, Selvas, Tundra)
          let sumLat = 0;
          outerRing.forEach((pt: number[]) => { sumLat += pt[1]; });
          const avgLat = sumLat / outerRing.length;
          let sumLng = 0;
          outerRing.forEach((pt: number[]) => { sumLng += pt[0]; });
          const avgLng = sumLng / outerRing.length;

          // Asignar color de terreno realista según la biogeografía real
          let landColor = '#244828'; // Verde vegetación templada

          const absLat = Math.abs(avgLat);
          if (absLat > 60) {
            landColor = '#dbeafe'; // Nieve y hielo polar / tundra (Groenlandia, Antártida, Norte de Canadá)
          } else if (avgLat > 12 && avgLat < 35 && avgLng > -18 && avgLng < 65) {
            landColor = '#b89458'; // Desierto del Sahara y Arabia (Arena Dorada)
          } else if (avgLat > 35 && avgLat < 48 && avgLng > 55 && avgLng < 105) {
            landColor = '#a8894f'; // Desiertos de Asia Central / Gobi
          } else if (avgLat > -32 && avgLat < -18 && avgLng > 112 && avgLng < 154) {
            landColor = '#bc7c47'; // Outback de Australia (Tierra Roja)
          } else if (absLat < 15) {
            landColor = '#173d1f'; // Selva Tropical Amazónica / Congo (Verde Esmeralda Profundo)
          } else if (absLat >= 15 && absLat <= 38) {
            landColor = '#32592c'; // Sabanas y bosques subtropicales
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

  // 3. Casquetes Polares (Norte y Sur)
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
  isEvaluated
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Modo de mapa: 'globe' (Globo Satelital 3D) o 'flat' (Mapa Plano 2D)
  const [mapMode, setMapMode] = useState<'globe' | 'flat'>('globe');

  // Referencias Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const arcMeshRef = useRef<THREE.Line | null>(null);
  const userPinMeshRef = useRef<THREE.Group | null>(null);
  const targetPinMeshRef = useRef<THREE.Group | null>(null);

  // Rotación y Zoom target para animación lerp 60fps
  const rotationRef = useRef<{ x: number; y: number }>({ x: 0, y: -0.2 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: -0.2 });
  const zoomScaleRef = useRef<number>(1.0);
  const targetZoomScaleRef = useRef<number>(1.0);

  // Arrastre con ratón / touch
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDistRef = useRef<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Convertir [lng, lat] a Vector3 3D en la superficie de la esfera de radio R
  const lngLatToVector3 = useCallback((lng: number, lat: number, radius: number = 1): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Convertir Vector3 3D a [lng, lat]
  const vector3ToLngLat = useCallback((vector: THREE.Vector3): [number, number] => {
    const norm = vector.clone().normalize();
    const lat = 90 - Math.acos(norm.y) * (180 / Math.PI);
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

    // 3. Renderer WebGL de Alta Definición
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Luces realistas de la atmósfera terrestre
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // 5. Crear Textura Satelital (Procedural de alta definición + Intento de carga de textura NASA)
    const procCanvas = generateSatelliteEarthTexture();
    const earthTexture = new THREE.CanvasTexture(procCanvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    // Intentar cargar la textura fotográfica oficial de la NASA si hay conexión
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

    // 6. Malla de la Esfera 3D de la Tierra (SIN LÍNEAS DE FRONTERAS)
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.1
    });

    const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    earthMeshRef.current = earthMesh;
    scene.add(earthMesh);

    // 7. Halo de la atmósfera terrestre
    const atmosGeometry = new THREE.SphereGeometry(1.03, 64, 64);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.15
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosMesh);

    // Bucle de Animación 60fps
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      // Lerp suave de rotación y zoom
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.12;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.12;
      zoomScaleRef.current += (targetZoomScaleRef.current - zoomScaleRef.current) * 0.12;

      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.y = rotationRef.current.x;
        earthMeshRef.current.rotation.x = rotationRef.current.y;
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = 3.5 / zoomScaleRef.current;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Redimensionar responsivamente
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

  // Actualizar Marcadores y Arco Neón 3D
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Limpiar marcadores anteriores
    if (userPinMeshRef.current) scene.remove(userPinMeshRef.current);
    if (targetPinMeshRef.current) scene.remove(targetPinMeshRef.current);
    if (arcMeshRef.current) scene.remove(arcMeshRef.current);

    // 1. Marcador del tiro del usuario (Mira Cian 3D)
    if (clickedCoords) {
      const pos = lngLatToVector3(clickedCoords[0], clickedCoords[1], 1.01);
      const userGroup = new THREE.Group();
      userGroup.position.copy(pos);

      const pinGeo = new THREE.SphereGeometry(0.025, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      userGroup.add(pinMesh);

      const ringGeo = new THREE.RingGeometry(0.03, 0.045, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      userGroup.add(ringMesh);

      userPinMeshRef.current = userGroup;
      scene.add(userGroup);
    }

    // 2. Marcador del objetivo real (Baliza Esmeralda 3D) + Arco Conector
    if (targetCoords && isEvaluated) {
      const targetPos = lngLatToVector3(targetCoords[0], targetCoords[1], 1.01);
      const targetGroup = new THREE.Group();
      targetGroup.position.copy(targetPos);

      const pinGeo = new THREE.SphereGeometry(0.03, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      targetGroup.add(pinMesh);

      targetPinMeshRef.current = targetGroup;
      scene.add(targetGroup);

      // Dibujar arco curvado 3D entre el tiro y el objetivo
      if (clickedCoords) {
        const startPos = lngLatToVector3(clickedCoords[0], clickedCoords[1], 1.01);
        const endPos = targetPos;

        const points: THREE.Vector3[] = [];
        const numPoints = 50;

        for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints;
          const p = new THREE.Vector3().lerpVectors(startPos, endPos, t);
          // Elevar el arco 3D sobre la superficie para formar una curva parabólica
          const dist = startPos.distanceTo(endPos);
          const altitude = Math.sin(t * Math.PI) * (dist * 0.25);
          p.normalize().multiplyScalar(1.01 + altitude);
          points.push(p);
        }

        const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const arcMaterial = new THREE.LineBasicMaterial({
          color: 0x22d3ee,
          linewidth: 3
        });

        const arcLine = new THREE.Line(arcGeometry, arcMaterial);
        arcMeshRef.current = arcLine;
        scene.add(arcLine);

        // Auto-rotar la cámara 3D para centrar el tiro y el objetivo de frente
        let midLng = (clickedCoords[0] + targetCoords[0]) / 2;
        if (Math.abs(clickedCoords[0] - targetCoords[0]) > 180) {
          midLng += 180;
        }
        const midLat = (clickedCoords[1] + targetCoords[1]) / 2;

        const rotX = -((midLng + 180) * (Math.PI / 180) - Math.PI);
        const rotY = -(midLat * (Math.PI / 180));
        targetRotationRef.current = { x: rotX, y: rotY };
      }
    }
  }, [clickedCoords, targetCoords, isEvaluated, lngLatToVector3]);

  // Controles manuales
  const handleZoomIn = () => {
    targetZoomScaleRef.current = Math.min(targetZoomScaleRef.current * 1.35, 4.0);
  };

  const handleZoomOut = () => {
    targetZoomScaleRef.current = Math.max(targetZoomScaleRef.current / 1.35, 0.6);
  };

  const handleResetView = () => {
    targetRotationRef.current = { x: 0, y: -0.2 };
    targetZoomScaleRef.current = 1.0;
  };

  // Manejo de la rueda del ratón (Wheel Zoom)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.15 : 0.87;
    targetZoomScaleRef.current = Math.max(0.6, Math.min(4.0, targetZoomScaleRef.current * delta));
  };

  // Arrastre con ratón / táctil en 3D
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

    const sensitivity = 0.005 / zoomScaleRef.current;
    // Movimiento físico natural 3D:
    // Arrastrar abajo (dy > 0) tira de la esfera hacia abajo (viendo el Hemisferio Norte).
    const newRotX = rotationStartRef.current.x + dx * sensitivity;
    const newRotY = Math.max(-1.4, Math.min(1.4, rotationStartRef.current.y - dy * sensitivity));

    rotationRef.current = { x: newRotX, y: newRotY };
    targetRotationRef.current = { x: newRotX, y: newRotY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const isClick = dragDistRef.current < 6;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (isClick && !isEvaluated && mountRef.current && cameraRef.current && earthMeshRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Raycasting 3D exacto sobre la superficie esférica de la Tierra
      const mouse = new THREE.Vector2(
        (clickX / rect.width) * 2 - 1,
        -(clickY / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObject(earthMeshRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        // Transformar punto a coordenadas locales de la esfera rotada
        const localPoint = earthMeshRef.current.worldToLocal(point.clone());
        const [lng, lat] = vector3ToLngLat(localPoint);

        // Disparar evaluación inmediata del tiro sin confirmación previa
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
            ? 'Resultado evaluado. Haz clic en "Siguiente Ciudad" para continuar.'
            : 'Arrastra para girar la Esfera Satelital 3D y haz clic directo sobre la ubicación.'}
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
