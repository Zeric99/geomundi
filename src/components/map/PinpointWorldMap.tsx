import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Crosshair, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

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

  // Coordenadas esféricas de la Cámara Orbit (theta: acimutal, phi: polar de 0.08 a PI-0.08)
  const sphericalRef = useRef<{ theta: number; phi: number }>({ theta: 0, phi: Math.PI / 2 });
  const targetSphericalRef = useRef<{ theta: number; phi: number }>({ theta: 0, phi: Math.PI / 2 });
  const velocityRef = useRef<{ theta: number; phi: number }>({ theta: 0, phi: 0 });

  const zoomScaleRef = useRef<number>(1.0);
  const targetZoomScaleRef = useRef<number>(1.0);

  // Arrastre con ratón / touch
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalStartRef = useRef<{ theta: number; phi: number }>({ theta: 0, phi: Math.PI / 2 });
  const dragDistRef = useRef<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Convertir [lng, lat] a Vector3 3D exacto en la superficie de la Tierra (R=1.01)
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

  // Inicializar Escena Three.js 3D con Orbit Spherical Camera
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Escena
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Cámara (Inicializada mirando el ecuador)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.5);
    camera.up.set(0, 1, 0); // Eje norte siempre alineado verticalmente
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

    // 5. Textura Satelital NASA (topo + batimetría, 5400x2700)
    //    offset.x = 0.25 corrige el desfase equirrectangular de Three.js con nuestro sistema lngLatToVector3
    const textureLoader = new THREE.TextureLoader();
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    earthMeshRef.current = earthMesh;
    scene.add(earthMesh);

    textureLoader.load(
      '/earth_texture.jpg',
      (earthTexture) => {
        earthTexture.colorSpace = THREE.SRGBColorSpace;
        earthTexture.wrapS = THREE.RepeatWrapping;
        earthTexture.offset.x = 0.25; // Alinea lng=0 (Meridiano Greenwich) correctamente
        sphereMaterial.map = earthTexture;
        sphereMaterial.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn('NASA texture failed to load, using fallback color:', err);
        sphereMaterial.color.set(0x1a5276);
        sphereMaterial.needsUpdate = true;
      }
    );

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

    // Bucle de Animación a 60fps con Inercia Damping
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      // Inercia / desaceleración progresiva tras soltar el arrastre
      if (!isPointerDownRef.current) {
        velocityRef.current.theta *= 0.70;
        velocityRef.current.phi *= 0.70;

        if (Math.abs(velocityRef.current.theta) > 0.00005) {
          targetSphericalRef.current.theta += velocityRef.current.theta;
        }
        if (Math.abs(velocityRef.current.phi) > 0.00005) {
          targetSphericalRef.current.phi = Math.max(
            0.08,
            Math.min(Math.PI - 0.08, targetSphericalRef.current.phi + velocityRef.current.phi)
          );
        }
      }

      // Lerp suave hacia las coordenadas esféricas target y zoom
      sphericalRef.current.theta += (targetSphericalRef.current.theta - sphericalRef.current.theta) * 0.14;
      sphericalRef.current.phi += (targetSphericalRef.current.phi - sphericalRef.current.phi) * 0.14;
      zoomScaleRef.current += (targetZoomScaleRef.current - zoomScaleRef.current) * 0.14;

      // Posicionar cámara usando coordenadas esféricas Orbit (Radio, Phi, Theta)
      if (cameraRef.current) {
        const radius = 3.5 / zoomScaleRef.current;
        const phi = sphericalRef.current.phi;
        const theta = sphericalRef.current.theta;

        cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
        cameraRef.current.position.y = radius * Math.cos(phi);
        cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
        cameraRef.current.up.set(0, 1, 0); // Eje norte 100% recto
        cameraRef.current.lookAt(0, 0, 0);
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

      // Centrar suavemente la cámara en el último tiro registrado
      const lastPin = previousPins[previousPins.length - 1];
      let midLng = (lastPin.clickedCoords[0] + lastPin.targetCoords[0]) / 2;
      if (Math.abs(lastPin.clickedCoords[0] - lastPin.targetCoords[0]) > 180) {
        midLng += 180;
        if (midLng > 180) midLng -= 360;
      }
      const midLat = (lastPin.clickedCoords[1] + lastPin.targetCoords[1]) / 2;

      const tTheta = (midLng + 90) * (Math.PI / 180);
      const tPhi = Math.max(0.08, Math.min(Math.PI - 0.08, (90 - midLat) * (Math.PI / 180)));
      targetSphericalRef.current = { theta: tTheta, phi: tPhi };
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

      const tTheta = (midLng + 90) * (Math.PI / 180);
      const tPhi = Math.max(0.08, Math.min(Math.PI - 0.08, (90 - midLat) * (Math.PI / 180)));
      targetSphericalRef.current = { theta: tTheta, phi: tPhi };
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
    targetSphericalRef.current = { theta: 0, phi: Math.PI / 2 };
    targetZoomScaleRef.current = 1.0;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.15 : 0.87;
    targetZoomScaleRef.current = Math.max(0.6, Math.min(4.0, targetZoomScaleRef.current * delta));
  };

  // Arrastre 1:1 idéntico a MapTap.gg con Clamping Polar de la Antártida e Inercia Damping
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    sphericalStartRef.current = { ...sphericalRef.current };
    velocityRef.current = { theta: 0, phi: 0 };
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

    const sensitivity = 0.004 / zoomScaleRef.current;
    
    // Cambios angulares esféricos:
    const deltaTheta = - dx * sensitivity;
    const deltaPhi = - dy * sensitivity;

    velocityRef.current = { theta: deltaTheta * 0.06, phi: deltaPhi * 0.06 };

    const newTheta = sphericalStartRef.current.theta + deltaTheta;
    // Clampear phi entre 0.08 rad (Polo Norte) y PI - 0.08 rad (Antártida / Polo Sur)
    const newPhi = Math.max(0.08, Math.min(Math.PI - 0.08, sphericalStartRef.current.phi + deltaPhi));

    targetSphericalRef.current = { theta: newTheta, phi: newPhi };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const isClick = dragDistRef.current < 6;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (isClick && !isEvaluated && mountRef.current && cameraRef.current && earthMeshRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Raycasting 3D exacto sobre la superficie de la Tierra
      const mouse = new THREE.Vector2(
        (clickX / rect.width) * 2 - 1,
        -(clickY / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObject(earthMeshRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const [lng, lat] = vector3ToLngLat(point);

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
