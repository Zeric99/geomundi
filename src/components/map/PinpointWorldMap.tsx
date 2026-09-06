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

/**
 * Calcula distancia Haversine exacta en kilómetros entre dos coordenadas [lng, lat]
 */
function computeDistanceKm(c1: [number, number], c2: [number, number]): number {
  const R = 6371;
  const dLat = ((c2[1] - c1[1]) * Math.PI) / 180;
  const dLon = ((c2[0] - c1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1[1] * Math.PI) / 180) *
      Math.cos((c2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Genera textura Canvas 2D ultra-crisp para el Badge Flotante 3D (Billboard)
 * con diseño táctico de alta gama, degradado según distancia y puntero direccional.
 */
function createCityBadgeTexture(cityName: string, distanceKm?: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 512, 192);

  const pad = 10;
  const x = pad;
  const y = pad;
  const w = 512 - pad * 2;
  const h = 136;
  const r = 24;

  let accentColor = '#10b981'; // Esmeralda
  let bgGradTop = 'rgba(6, 78, 59, 0.94)';
  let bgGradBot = 'rgba(2, 44, 34, 0.98)';
  let badgeLabel = '🎯 ¡Diana!';
  const distText = distanceKm !== undefined ? `${distanceKm.toLocaleString()} km` : '';

  if (distanceKm !== undefined) {
    if (distanceKm < 150) {
      accentColor = '#10b981';
      badgeLabel = '🎯 ¡Diana!';
      bgGradTop = 'rgba(6, 78, 59, 0.94)';
      bgGradBot = 'rgba(2, 44, 34, 0.98)';
    } else if (distanceKm < 600) {
      accentColor = '#06b6d4';
      badgeLabel = '✨ ¡Muy cerca!';
      bgGradTop = 'rgba(8, 51, 68, 0.94)';
      bgGradBot = 'rgba(4, 30, 42, 0.98)';
    } else if (distanceKm < 1800) {
      accentColor = '#eab308';
      badgeLabel = '📍 Buen intento';
      bgGradTop = 'rgba(66, 32, 6, 0.94)';
      bgGradBot = 'rgba(38, 18, 4, 0.98)';
    } else {
      accentColor = '#f43f5e';
      badgeLabel = '🧭 Lejos';
      bgGradTop = 'rgba(76, 5, 25, 0.94)';
      bgGradBot = 'rgba(42, 3, 14, 0.98)';
    }
  }

  // Dibujar silueta de tarjeta con puntero inferior hacia la baliza
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

  // Pico puntero inferior
  ctx.lineTo(256 + 20, y + h);
  ctx.lineTo(256, 175);
  ctx.lineTo(256 - 20, y + h);

  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, bgGradTop);
  grad.addColorStop(1, bgGradBot);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();

  // Nombre de la Ciudad
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 8;
  const displayCity = cityName || 'Objetivo';
  ctx.fillText(displayCity, 256, 60);

  // Distancia y Medalla
  if (distText) {
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = accentColor;
    ctx.shadowBlur = 4;
    ctx.fillText(`📏 ${distText}  •  ${badgeLabel}`, 256, 108);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const PinpointWorldMap: React.FC<PinpointWorldMapProps> = ({
  clickedCoords,
  targetCoords,
  onMapClick,
  isEvaluated,
  previousPins = [],
  continent,
  cityName
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

    // 5. Textura NASA real (topo + batimetría satelital)
    //    BASE_URL resuelve correctamente la ruta en GitHub Pages con subdirectorio.
    //    IMPORTANTE: Sin offset (tex.offset.x = 0). Las coordenadas UV de Three.js SphereGeometry
    //    están en 100% sincronía matemática directa con lngLatToVector3.
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.75,
      metalness: 0.05,
      color: 0x0d3d6e // placeholder azul marino mientras carga
    });
    const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    earthMeshRef.current = earthMesh;
    scene.add(earthMesh);

    const textureUrl = import.meta.env.BASE_URL + 'earth_texture.jpg';
    new THREE.TextureLoader().load(
      textureUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        // tex.offset.x es 0 por defecto. Esto alinea Greenwich (0°) con UV u=0.5
        // y América (-90°) con UV u=0.25, calibrando 100% con lngLatToVector3
        sphereMaterial.map = tex;
        sphereMaterial.color.set(0xffffff);
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

    // Reloj Three.js para animaciones suaves
    const clock = new THREE.Clock();

    // Bucle de Animación a 60fps con Inercia Damping y Actualizadores de FX
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Ejecutar animadores activos (trazador de arco, ondas de impacto, gemas flotantes, etc.)
      animatorsRef.current.forEach(fn => fn(delta, elapsed));

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

  // Animadores de efectos especiales 3D
  const animatorsRef = useRef<((delta: number, elapsed: number) => void)[]>([]);

  // Renderizar Marcadores y Arcos 3D con Animación Espectacular
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (markersGroupRef.current) {
      scene.remove(markersGroupRef.current);
      markersGroupRef.current = null;
    }

    // Limpiar animadores anteriores
    animatorsRef.current = [];

    const group = new THREE.Group();

    // Helper: Orientar objeto según la normal de la superficie esférica
    const alignToSphereSurface = (obj: THREE.Object3D, surfacePos: THREE.Vector3) => {
      obj.position.copy(surfacePos);
      obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfacePos.clone().normalize());
    };

    const drawPinAndArc = (
      userCoords: [number, number],
      tCoords: [number, number],
      isHistorical: boolean = false,
      cName?: string
    ) => {
      const userPos = lngLatToVector3(userCoords[0], userCoords[1], 1.01);
      const targetPos = lngLatToVector3(tCoords[0], tCoords[1], 1.01);
      const distKm = computeDistanceKm(userCoords, tCoords);

      // ============================================================
      // 1. PIN DEL JUGADOR (Cian Neón Táctico)
      // ============================================================
      const userGroup = new THREE.Group();
      alignToSphereSurface(userGroup, userPos);

      // Aro base en la superficie
      const userRingGeo = new THREE.RingGeometry(0.015, 0.032, 32);
      userRingGeo.rotateX(-Math.PI / 2);
      const userRingMat = new THREE.MeshBasicMaterial({
        color: isHistorical ? 0x0891b2 : 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isHistorical ? 0.6 : 0.95
      });
      const userRing = new THREE.Mesh(userRingGeo, userRingMat);
      userGroup.add(userRing);

      // Aguja vertical cian
      const userSpikeGeo = new THREE.ConeGeometry(0.01, 0.055, 16);
      userSpikeGeo.translate(0, 0.0275, 0);
      const userSpikeMat = new THREE.MeshBasicMaterial({
        color: isHistorical ? 0x0e7490 : 0x22d3ee,
        transparent: true,
        opacity: isHistorical ? 0.5 : 0.9
      });
      const userSpike = new THREE.Mesh(userSpikeGeo, userSpikeMat);
      userGroup.add(userSpike);

      // Cabeza esférica brillante del pin
      const userHeadGeo = new THREE.SphereGeometry(isHistorical ? 0.016 : 0.022, 16, 16);
      const userHeadMat = new THREE.MeshBasicMaterial({
        color: isHistorical ? 0x0891b2 : 0xffffff
      });
      const userHead = new THREE.Mesh(userHeadGeo, userHeadMat);
      userHead.position.set(0, 0.055, 0);
      userGroup.add(userHead);

      // Onda de choque (radar ripple) al impactar el tiro del usuario
      if (!isHistorical) {
        const rippleGeo = new THREE.RingGeometry(0.015, 0.035, 32);
        rippleGeo.rotateX(-Math.PI / 2);
        const rippleMat = new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9
        });
        const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
        userGroup.add(rippleMesh);

        let rippleTime = 0;
        animatorsRef.current.push((delta) => {
          rippleTime += delta;
          const cycle = (rippleTime % 1.2) / 1.2;
          const scale = 1 + cycle * 2.8;
          rippleMesh.scale.set(scale, scale, scale);
          rippleMat.opacity = Math.max(0, (1 - cycle) * 0.85);
        });
      }

      group.add(userGroup);

      // ============================================================
      // 2. ARCO DINÁMICO TIPO LÁSER (Trazador animado de cian a verde)
      // ============================================================
      const numArcPoints = 64;
      const arcPoints: THREE.Vector3[] = [];
      const arcColors: number[] = [];
      const chordDist = userPos.distanceTo(targetPos);
      const maxAlt = Math.min(0.38, Math.max(0.04, chordDist * 0.28));

      for (let i = 0; i <= numArcPoints; i++) {
        const t = i / numArcPoints;
        const p = new THREE.Vector3().lerpVectors(userPos, targetPos, t);
        const altitude = Math.sin(t * Math.PI) * maxAlt;
        p.normalize().multiplyScalar(1.01 + altitude);
        arcPoints.push(p);

        // Degradado de color: Cian neón -> Esmeralda vibrante
        const colorStart = new THREE.Color(isHistorical ? 0x0891b2 : 0x06b6d4);
        const colorEnd = new THREE.Color(isHistorical ? 0x059669 : 0x10b981);
        const curColor = colorStart.clone().lerp(colorEnd, t);
        arcColors.push(curColor.r, curColor.g, curColor.b);
      }

      const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
      arcGeometry.setAttribute('color', new THREE.Float32BufferAttribute(arcColors, 3));
      const arcMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: isHistorical ? 1 : 3,
        transparent: true,
        opacity: isHistorical ? 0.45 : 0.95
      });
      const arcLine = new THREE.Line(arcGeometry, arcMaterial);
      group.add(arcLine);

      // Spark trazador que viaja por la punta del arco
      let tracerMesh: THREE.Mesh | null = null;
      if (!isHistorical) {
        arcGeometry.setDrawRange(0, 2);
        const tracerGeo = new THREE.SphereGeometry(0.02, 16, 16);
        const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        tracerMesh = new THREE.Mesh(tracerGeo, tracerMat);
        tracerMesh.position.copy(arcPoints[0]);
        group.add(tracerMesh);
      } else {
        arcGeometry.setDrawRange(0, numArcPoints + 1);
      }

      // ============================================================
      // 3. PIN DEL OBJETIVO REAL (Baliza Neón Esmeralda + Gema Flotante)
      // ============================================================
      const targetGroup = new THREE.Group();
      alignToSphereSurface(targetGroup, targetPos);

      // Aro base esmeralda
      const targetRingGeo = new THREE.RingGeometry(0.016, 0.038, 32);
      targetRingGeo.rotateX(-Math.PI / 2);
      const targetRingMat = new THREE.MeshBasicMaterial({
        color: isHistorical ? 0x059669 : 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isHistorical ? 0.6 : 0.95
      });
      const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
      targetGroup.add(targetRing);

      // Aguja vertical dorada/esmeralda
      const targetSpikeGeo = new THREE.ConeGeometry(0.012, 0.065, 16);
      targetSpikeGeo.translate(0, 0.0325, 0);
      const targetSpikeMat = new THREE.MeshBasicMaterial({
        color: isHistorical ? 0x047857 : 0x34d399
      });
      const targetSpike = new THREE.Mesh(targetSpikeGeo, targetSpikeMat);
      targetGroup.add(targetSpike);

      // Gema / Diamante giratorio flotante en el objetivo
      const gemGeo = new THREE.OctahedronGeometry(isHistorical ? 0.018 : 0.026, 0);
      const gemMat = new THREE.MeshStandardMaterial({
        color: isHistorical ? 0x10b981 : 0x4ade80,
        emissive: isHistorical ? 0x047857 : 0x10b981,
        emissiveIntensity: isHistorical ? 0.3 : 0.7,
        roughness: 0.2,
        metalness: 0.8
      });
      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.position.set(0, 0.08, 0);
      targetGroup.add(gemMesh);

      // Ondas de choque en el objetivo cuando impacta
      let targetRipple1: THREE.Mesh | null = null;
      let targetRipple2: THREE.Mesh | null = null;
      if (!isHistorical) {
        const tRippGeo = new THREE.RingGeometry(0.02, 0.045, 32);
        tRippGeo.rotateX(-Math.PI / 2);
        const tRippMat1 = new THREE.MeshBasicMaterial({
          color: 0x34d399,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0
        });
        const tRippMat2 = new THREE.MeshBasicMaterial({
          color: 0x6ee7b7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0
        });
        targetRipple1 = new THREE.Mesh(tRippGeo, tRippMat1);
        targetRipple2 = new THREE.Mesh(tRippGeo.clone(), tRippMat2);
        targetGroup.add(targetRipple1);
        targetGroup.add(targetRipple2);
      }

      // Tarjeta flotante 3D (Billboard Sprite con nombre y distancia)
      let badgeSprite: THREE.Sprite | null = null;
      if (!isHistorical) {
        const badgeTex = createCityBadgeTexture(cName || cityName || 'Objetivo', distKm);
        const spriteMat = new THREE.SpriteMaterial({
          map: badgeTex,
          transparent: true,
          depthTest: false
        });
        badgeSprite = new THREE.Sprite(spriteMat);
        badgeSprite.center.set(0.5, 0.0); // El puntero inferior apunta al pin
        badgeSprite.scale.set(0, 0, 1); // Empieza en 0 para animación elástica
        badgeSprite.position.set(0, 0.12, 0);
        targetGroup.add(badgeSprite);
      }

      // Si no es histórico, ocultar objetivo inicialmente hasta que el rayo láser llegue
      if (!isHistorical) {
        targetGroup.scale.set(0, 0, 0);
      }

      group.add(targetGroup);

      // Partículas de chispas en el objetivo
      let particlesGroup: THREE.Group | null = null;
      if (!isHistorical) {
        particlesGroup = new THREE.Group();
        alignToSphereSurface(particlesGroup, targetPos);
        const pGeo = new THREE.SphereGeometry(0.008, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0 });
        for (let p = 0; p < 16; p++) {
          const spark = new THREE.Mesh(pGeo, pMat.clone());
          const ang = (p / 16) * Math.PI * 2;
          const speed = 0.04 + Math.random() * 0.04;
          spark.userData = {
            vx: Math.cos(ang) * speed,
            vy: 0.03 + Math.random() * 0.05,
            vz: Math.sin(ang) * speed
          };
          particlesGroup.add(spark);
        }
        group.add(particlesGroup);
      }

      // ============================================================
      // 4. ANIMADOR DEL TIRO ACTIVO (Láser -> Impacto -> Chispas -> Badge)
      // ============================================================
      let animProgress = 0;
      const animDuration = isHistorical ? 0 : 0.45; // 450ms de viaje del láser
      let impactTriggered = isHistorical;

      animatorsRef.current.push((delta) => {
        // Rotación constante de la gema del objetivo
        gemMesh.rotation.y += delta * 2.2;
        gemMesh.rotation.x = Math.sin(Date.now() * 0.003) * 0.2;

        if (isHistorical) return;

        animProgress += delta;
        const tArc = Math.min(1, animProgress / animDuration);
        const easeArc = 1 - Math.pow(1 - tArc, 3); // Cubic ease out

        // Dibujar el arco progresivamente
        const currentCount = Math.max(2, Math.floor(easeArc * numArcPoints));
        arcGeometry.setDrawRange(0, currentCount);

        // Mover la punta brillante del rayo
        if (tracerMesh) {
          const tipIdx = Math.min(numArcPoints, currentCount - 1);
          tracerMesh.position.copy(arcPoints[tipIdx]);
        }

        // Momento del impacto en la ciudad objetivo
        if (tArc >= 1 && !impactTriggered) {
          impactTriggered = true;
          if (tracerMesh) tracerMesh.visible = false;
        }

        if (impactTriggered) {
          const postImpactTime = animProgress - animDuration;

          // Animación elástica de entrada del pin objetivo
          const popT = Math.min(1, postImpactTime / 0.3);
          const popScale = Math.sin((popT * Math.PI) / 2) + Math.sin(popT * Math.PI * 2) * 0.15 * (1 - popT);
          targetGroup.scale.set(popScale, popScale, popScale);

          // Entrada elástica del badge flotante con la distancia
          if (badgeSprite) {
            const badgeT = Math.min(1, Math.max(0, (postImpactTime - 0.1) / 0.35));
            const bScale = Math.sin((badgeT * Math.PI) / 2) * 0.38;
            badgeSprite.scale.set(bScale, bScale * (192 / 512), 1);
          }

          // Ondas de choque en el objetivo
          if (targetRipple1 && targetRipple2) {
            const rTime1 = Math.min(1, postImpactTime / 0.7);
            const rScale1 = 1 + rTime1 * 3.5;
            targetRipple1.scale.set(rScale1, rScale1, rScale1);
            (targetRipple1.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - rTime1) * 0.9);

            const rTime2 = Math.min(1, Math.max(0, (postImpactTime - 0.15) / 0.7));
            const rScale2 = 1 + rTime2 * 3.0;
            targetRipple2.scale.set(rScale2, rScale2, rScale2);
            (targetRipple2.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - rTime2) * 0.7);
          }

          // Explosión de chispas
          if (particlesGroup && postImpactTime < 0.8) {
            const pFade = Math.max(0, 1 - postImpactTime / 0.8);
            particlesGroup.children.forEach((child) => {
              const spark = child as THREE.Mesh;
              spark.position.x += spark.userData.vx * delta * 2;
              spark.position.y += spark.userData.vy * delta * 2;
              spark.position.z += spark.userData.vz * delta * 2;
              (spark.material as THREE.MeshBasicMaterial).opacity = pFade;
            });
          }
        }
      });
    };

    // A. Dibujar pines históricos de rondas anteriores (más sutiles)
    if (previousPins && previousPins.length > 0) {
      previousPins.forEach((item, idx) => {
        const isLatest = idx === previousPins.length - 1 && !isEvaluated;
        drawPinAndArc(item.clickedCoords, item.targetCoords, !isLatest, item.cityName);
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
      drawPinAndArc(clickedCoords, targetCoords, false, cityName);

      let midLng = (clickedCoords[0] + targetCoords[0]) / 2;
      if (Math.abs(clickedCoords[0] - targetCoords[0]) > 180) {
        midLng += 180;
        if (midLng > 180) midLng -= 360;
      }
      const midLat = (clickedCoords[1] + targetCoords[1]) / 2;

      const tTheta = (midLng + 90) * (Math.PI / 180);
      const tPhi = Math.max(0.08, Math.min(Math.PI - 0.08, (90 - midLat) * (Math.PI / 180)));
      targetSphericalRef.current = { theta: tTheta, phi: tPhi };

      // Zoom dinámico según la distancia del tiro para un encuadre cinemático óptimo
      const dKm = computeDistanceKm(clickedCoords, targetCoords);
      if (dKm < 500) {
        targetZoomScaleRef.current = 1.35;
      } else if (dKm > 4000) {
        targetZoomScaleRef.current = 0.85;
      } else {
        targetZoomScaleRef.current = 1.05;
      }
    } else if (clickedCoords && !isEvaluated) {
      // Tiro individual en progreso con onda de pulso cian
      const userPos = lngLatToVector3(clickedCoords[0], clickedCoords[1], 1.01);
      const userGroup = new THREE.Group();
      userGroup.position.copy(userPos);
      userGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), userPos.clone().normalize());

      const pinGeo = new THREE.SphereGeometry(0.024, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(0, 0.04, 0);
      userGroup.add(pinMesh);

      const spikeGeo = new THREE.ConeGeometry(0.01, 0.05, 16);
      spikeGeo.translate(0, 0.025, 0);
      const spikeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      userGroup.add(new THREE.Mesh(spikeGeo, spikeMat));

      const ripGeo = new THREE.RingGeometry(0.015, 0.035, 32);
      ripGeo.rotateX(-Math.PI / 2);
      const ripMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const ripMesh = new THREE.Mesh(ripGeo, ripMat);
      userGroup.add(ripMesh);

      let rTime = 0;
      animatorsRef.current.push((delta) => {
        rTime += delta;
        const cyc = (rTime % 1.0) / 1.0;
        const sc = 1 + cyc * 2.5;
        ripMesh.scale.set(sc, sc, sc);
        ripMat.opacity = (1 - cyc) * 0.9;
      });

      group.add(userGroup);
    }

    markersGroupRef.current = group;
    scene.add(group);
  }, [clickedCoords, targetCoords, isEvaluated, previousPins, cityName, lngLatToVector3]);

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
