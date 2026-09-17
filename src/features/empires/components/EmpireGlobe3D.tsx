import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { UserEmpire } from '../types';
import { geoGridService } from '../services/geoGridService';

interface EmpireGlobe3DProps {
  empire: UserEmpire;
}

export const EmpireGlobe3D: React.FC<EmpireGlobe3DProps> = ({ empire }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Referencias persistentes para no recrear Three.js en cada tick
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const colonizedGroupRef = useRef<THREE.Group | null>(null);
  const expeditionsGroupRef = useRef<THREE.Group | null>(null);
  const empireRef = useRef<UserEmpire>(empire);
  empireRef.current = empire;

  const globeRadius = 80;

  // 1. Inicialización de Three.js (UNA SOLA VEZ al montar)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Escena, Cámara y Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(150, 100, 150);
    scene.add(dirLight);

    // Grupo principal del Globo
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Subgrupos para capas dinámicas (sus rotaciones heredan de globeGroup)
    const colonizedGroup = new THREE.Group();
    globeGroup.add(colonizedGroup);
    colonizedGroupRef.current = colonizedGroup;

    const expeditionsGroup = new THREE.Group();
    globeGroup.add(expeditionsGroup);
    expeditionsGroupRef.current = expeditionsGroup;

    // Océanos (Esfera base azul oscura con brillo sutil)
    const oceanGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0x0a1633,
      emissive: 0x050c1e,
      specular: 0x1e3a5f,
      shininess: 25
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    globeGroup.add(oceanMesh);

    // Atmósfera suave
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.015, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // Cuadrícula de Tierra neutral (solo puntos que NO están colonizados)
    const landTiles = geoGridService.getAllLandTiles();
    const landGeo = new THREE.BufferGeometry();
    const landPositions: number[] = [];

    landTiles.forEach(tile => {
      const r = globeRadius * 1.003;
      const phi = (90 - tile.lat) * (Math.PI / 180);
      const theta = (tile.lon + 180) * (Math.PI / 180);

      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = (r * Math.sin(phi) * Math.sin(theta));
      const y = (r * Math.cos(phi));

      landPositions.push(x, y, z);
    });

    landGeo.setAttribute('position', new THREE.Float32BufferAttribute(landPositions, 3));
    const landMat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x1a2e4c,
      transparent: true,
      opacity: 0.9
    });
    const landPoints = new THREE.Points(landGeo, landMat);
    globeGroup.add(landPoints);

    // Controles de Rotación Interactiva con Inercia persistente
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      velocityX = deltaX * 0.005;
      velocityY = deltaY * 0.005;

      globeGroup.rotation.y += velocityX;
      globeGroup.rotation.x += velocityY;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(120, Math.min(380, camera.position.z + e.deltaY * 0.15));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Bucle de renderizado continuo (persiste sin reiniciarse nunca)
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!isMouseDown) {
        velocityX *= 0.94;
        velocityY *= 0.94;
        globeGroup.rotation.y += velocityX + 0.0012; // Giro sutil continuo del planeta
        globeGroup.rotation.x += velocityY;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      renderer.dispose();
      oceanGeo.dispose();
      oceanMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      landGeo.dispose();
      landMat.dispose();
      if (dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
    };
  }, []);

  // 2. Actualizar visuales del Imperio con Auténticas Casillas Cuadradas
  useEffect(() => {
    const colonizedGroup = colonizedGroupRef.current;
    const expeditionsGroup = expeditionsGroupRef.current;
    if (!colonizedGroup || !expeditionsGroup) return;

    // Limpiar elementos dinámicos previos
    while (colonizedGroup.children.length > 0) {
      const child = colonizedGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
      colonizedGroup.remove(child);
    }

    while (expeditionsGroup.children.length > 0) {
      const child = expeditionsGroup.children[0] as THREE.Line;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
      expeditionsGroup.remove(child);
    }

    // Material único y homogéneo del color del imperio para TODO el territorio
    const empireColor = new THREE.Color(empire.colorHex || '#3B82F6');
    const unifiedEmpireMaterial = new THREE.MeshPhongMaterial({
      color: empireColor,
      specular: 0x444444,
      shininess: 30
    });

    // Geometría Cuadrada (BoxGeometry: ancho x alto x profundidad)
    // Dimensiones calibradas para representar exactamente una casilla cuadrangular
    const boxSize = 2.0;
    const boxHeight = 0.7;
    const squareTileGeo = new THREE.BoxGeometry(boxSize, boxHeight, boxSize);
    const squareEdgesGeo = new THREE.EdgesGeometry(squareTileGeo);

    // Aristas cuadradas sutilmente iluminadas para delimitar cada cuadrado del mosaico
    const edgeColor = empireColor.clone().offsetHSL(0, 0, 0.22);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: edgeColor,
      transparent: true,
      opacity: 0.8
    });

    // Geometría y material de la Capital Imperial (cuadrado dorado elevado)
    const capitalCrownGeo = new THREE.BoxGeometry(boxSize * 1.08, 0.35, boxSize * 1.08);
    const capitalCrownMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const capitalEdgesGeo = new THREE.EdgesGeometry(capitalCrownGeo);
    const capitalEdgesMat = new THREE.LineBasicMaterial({ color: 0xfffbeb });

    const colonizedTileIds = Object.keys(empire.colonizedTiles);

    colonizedTileIds.forEach(id => {
      const tile = geoGridService.getTile(id);
      if (!tile) return;

      const phi = (90 - tile.lat) * (Math.PI / 180);
      const theta = (tile.lon + 180) * (Math.PI / 180);
      const r = globeRadius * 1.012;

      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = (r * Math.sin(phi) * Math.sin(theta));
      const y = (r * Math.cos(phi));

      const normal = new THREE.Vector3(x, y, z).normalize();

      // Orientación Norte-Sur y Este-Oeste para que las caras del cuadrado sigan la cuadrícula del mapa
      const worldNorth = new THREE.Vector3(0, 1, 0);
      let north = worldNorth.clone().sub(normal.clone().multiplyScalar(worldNorth.dot(normal)));
      if (north.lengthSq() < 0.0001) {
        north = new THREE.Vector3(0, 0, 1);
      } else {
        north.normalize();
      }
      const east = new THREE.Vector3().crossVectors(north, normal).normalize();

      const rotMatrix = new THREE.Matrix4();
      rotMatrix.makeBasis(east, normal, north);

      // Casilla Cuadrada
      const squareMesh = new THREE.Mesh(squareTileGeo, unifiedEmpireMaterial);
      squareMesh.position.set(x, y, z);
      squareMesh.setRotationFromMatrix(rotMatrix);

      // Contorno de aristas cuadradas
      const wireframe = new THREE.LineSegments(squareEdgesGeo, edgeMaterial);
      squareMesh.add(wireframe);

      colonizedGroup.add(squareMesh);

      // Si es la Capital Imperial, añadir un remate cuadrado dorado en la parte superior
      if (id === empire.capitalTileId) {
        const rCap = globeRadius * 1.018;
        const cx = -(rCap * Math.sin(phi) * Math.cos(theta));
        const cz = (rCap * Math.sin(phi) * Math.sin(theta));
        const cy = (rCap * Math.cos(phi));

        const crownMesh = new THREE.Mesh(capitalCrownGeo, capitalCrownMat);
        crownMesh.position.set(cx, cy, cz);
        crownMesh.setRotationFromMatrix(rotMatrix);

        const crownEdges = new THREE.LineSegments(capitalEdgesGeo, capitalEdgesMat);
        crownMesh.add(crownEdges);

        colonizedGroup.add(crownMesh);
      }
    });

    // Rutas de Expediciones Marítimas Activas
    const activeExps = (empire.expeditions || []).filter(e => e.status === 'sailing');
    const toVec = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    activeExps.forEach(exp => {
      const origTile = geoGridService.getTile(exp.originTileId);
      const destTile = geoGridService.getTile(exp.destinationTileId);
      if (!origTile || !destTile) return;

      const v0 = toVec(origTile.lat, origTile.lon, globeRadius * 1.01);
      const v1 = toVec(destTile.lat, destTile.lon, globeRadius * 1.01);
      const mid = v0.clone().add(v1).multiplyScalar(0.5);
      const dist = v0.distanceTo(v1);

      mid.normalize().multiplyScalar(globeRadius * (1.02 + Math.min(0.25, dist / (globeRadius * 3))));

      const curve = new THREE.QuadraticBezierCurve3(v0, mid, v1);
      const points = curve.getPoints(30);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 2,
        gapSize: 2
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      arcLine.computeLineDistances();
      expeditionsGroup.add(arcLine);
    });

  }, [empire.colonizedTiles, empire.colorHex, empire.capitalTileId, empire.expeditions]);

  return (
    <div className="relative w-full h-full bg-radial-at-c from-zinc-900 to-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute left-4 bottom-4 bg-zinc-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-400 font-medium z-10 pointer-events-none">
        🌐 Arrastra para rotar la Tierra | Rueda para zoom
      </div>
    </div>
  );
};
