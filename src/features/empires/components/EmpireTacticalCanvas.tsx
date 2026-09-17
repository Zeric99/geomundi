import React, { useRef, useEffect, useState, useCallback } from 'react';
import { UserEmpire, GridTile, getCountryWonder, getTileVisualColor } from '../types';
import { geoGridService, GRID_COLS, GRID_ROWS } from '../services/geoGridService';
import { empireStorageService } from '../services/empireStorageService';
import { empireSound } from '../services/empireSoundService';
import { Compass, Anchor, Coins } from 'lucide-react';

interface EmpireTacticalCanvasProps {
  empire: UserEmpire;
  selectedTile: GridTile | null;
  onSelectTile: (tile: GridTile | null) => void;
  onRequestFoundCapital: (tile: GridTile) => void;
  expeditionOriginTileId?: string | null;
  onSelectExpeditionDest?: (destTileId: string) => void;
  onCancelExpeditionMode?: () => void;
}

const TILE_BASE_SIZE = 9; // Tamaño base por celda a 720x300

/**
 * Dibuja la ruta marítima náutica, la estela de puntitos blanca y el barquito
 */
/**
 * Dibuja la ruta marítima náutica real (A* por cuadrículas de agua),
 * la estela de puntitos blanca persistente (que se desvanece desde el origen tras la llegada)
 * y el barquito navegando con orientación y balanceo suave.
 */
function drawNauticalCurveAndShip(
  ctx: CanvasRenderingContext2D,
  origin: { x: number; y: number },
  dest: { x: number; y: number },
  progress: number,
  camX: number,
  camY: number,
  tileSize: number,
  now: number,
  label?: string,
  isAmbient?: boolean,
  route?: { x: number; y: number }[],
  completedAt?: number
) {
  const boatSize = Math.max(12, Math.min(26, Math.floor(tileSize * 0.95)));

  // Si tenemos una ruta A* por casillas de mar
  if (route && route.length >= 2) {
    const totalWaypoints = route.length;
    const clampedProgress = Math.min(1, Math.max(0, progress));

    // Determinar índice actual del barco en la ruta
    const floatIdx = clampedProgress * (totalWaypoints - 1);
    const currIdx = Math.min(totalWaypoints - 2, Math.floor(floatIdx));
    const subProgress = floatIdx - currIdx;

    const pA = route[currIdx];
    const pB = route[currIdx + 1];

    const shipGx = pA.x + (pB.x - pA.x) * subProgress;
    const shipGy = pA.y + (pB.y - pA.y) * subProgress;

    const shipSx = camX + (shipGx + 0.5) * tileSize;
    const shipSy = camY + (shipGy + 0.5) * tileSize;

    // Calcular inicio de la estela (borrado retráctil desde el origen tras la llegada)
    let startIdx = 0;
    let globalAlpha = isAmbient ? 0.7 : 0.95;

    if (completedAt) {
      const timeSinceArrival = now - completedAt;
      const retractRatio = Math.min(1, Math.max(0, timeSinceArrival / 4500));
      startIdx = Math.floor(retractRatio * totalWaypoints);
      globalAlpha *= (1 - retractRatio * 0.5);
    }

    // Dibujar la estela de puntitos blanca sobre la ruta recorrida
    const endPointIdx = clampedProgress >= 1 ? totalWaypoints - 1 : currIdx + 1;

    if (endPointIdx > startIdx && globalAlpha > 0.05) {
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = `rgba(255, 255, 255, ${globalAlpha.toFixed(2)})`;
      ctx.lineWidth = isAmbient ? 1.2 : 1.8;
      ctx.beginPath();

      for (let i = startIdx; i <= endPointIdx; i++) {
        const pt = route[i];
        const sx = camX + (pt.x + 0.5) * tileSize;
        const sy = camY + (pt.y + 0.5) * tileSize;
        if (i === startIdx) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }

      // Si el barco está en medio de un segmento, conectar exactamente hasta la popa del barco
      if (clampedProgress < 1) {
        ctx.lineTo(shipSx, shipSy);
      }

      ctx.stroke();
      ctx.restore();
    }

    // Si aún está navegando o recién llegado, dibujar barquito
    if (clampedProgress < 1 || (completedAt && now - completedAt < 2500)) {
      ctx.save();
      const waveBob = Math.sin(now / 750) * 1.5;
      ctx.translate(shipSx, shipSy + waveBob);
      const tilt = Math.sin(now / 850) * 0.08;
      ctx.rotate(tilt);
      ctx.font = `${boatSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⛵', 0, 0);
      ctx.restore();

      // Etiqueta con segundos restantes
      if (label && clampedProgress < 1) {
        ctx.save();
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(label, shipSx, shipSy + waveBob - boatSize * 0.75);
        ctx.restore();
      }
    }
    return;
  }

  // Fallback si no hay ruta marítima: arco cuadrático
  const x0 = origin.x;
  const y0 = origin.y;
  const x1 = dest.x;
  const y1 = dest.y;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;

  const nx = -dy;
  const ny = dx;
  const len = Math.hypot(nx, ny);
  const curvature = len > 0 ? Math.min(22, len * 0.18) : 0;
  const cx = mx + (len > 0 ? (nx / len) * curvature : 0);
  const cy = my + (len > 0 ? (ny / len) * curvature : 0);

  // Estela persistente desde el origen hasta el barco; borrado desde el origen tras llegada
  let startU = 0;
  let alphaMult = isAmbient ? 0.7 : 0.95;
  if (completedAt) {
    const retract = Math.min(1, Math.max(0, (now - completedAt) / 4500));
    startU = retract;
    alphaMult *= (1 - retract * 0.5);
  }

  const endU = Math.min(1, Math.max(0, progress));

  if (endU > startU && alphaMult > 0.05) {
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alphaMult.toFixed(2)})`;
    ctx.lineWidth = isAmbient ? 1.2 : 1.8;
    ctx.beginPath();
    const steps = Math.max(10, Math.floor((endU - startU) * 30));
    for (let s = 0; s <= steps; s++) {
      const u = startU + (s / steps) * (endU - startU);
      const gx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1;
      const gy = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1;
      const sx = camX + (gx + 0.5) * tileSize;
      const sy = camY + (gy + 0.5) * tileSize;
      if (s === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Posición del barco
  const u = endU;
  const shipGx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1;
  const shipGy = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1;
  const shipSx = camX + (shipGx + 0.5) * tileSize;
  const shipSy = camY + (shipGy + 0.5) * tileSize;

  if (endU < 1 || (completedAt && now - completedAt < 2500)) {
    ctx.save();
    const waveBob = Math.sin(now / 750) * 1.5;
    ctx.translate(shipSx, shipSy + waveBob);
    const tilt = Math.sin(now / 850) * 0.08;
    ctx.rotate(tilt);
    ctx.font = `${boatSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⛵', 0, 0);
    ctx.restore();

    if (label && endU < 1) {
      ctx.save();
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(label, shipSx, shipSy + waveBob - boatSize * 0.75);
      ctx.restore();
    }
  }
}

export const EmpireTacticalCanvas: React.FC<EmpireTacticalCanvasProps> = ({
  empire,
  selectedTile,
  onSelectTile,
  onRequestFoundCapital,
  expeditionOriginTileId,
  onSelectExpeditionDest,
  onCancelExpeditionMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Barquitos comerciales ambientales (vida en el mapa)
  const ambientShipsRef = useRef<{
    id: string;
    originCoords: { x: number; y: number };
    destCoords: { x: number; y: number };
    startTime: number;
    durationMs: number;
    route?: { x: number; y: number }[];
  }[]>([]);
  const lastAmbientSpawnRef = useRef(Date.now());

  // Estado de la cámara (Pan y Zoom)
  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    zoom: 1.5
  });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const hoveredTileRef = useRef<GridTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<GridTile | null>(null);
  const [expeditionError, setExpeditionError] = useState<string | null>(null);
  const errorTimerRef = useRef<any>(null);

  const triggerExpeditionError = (msg: string) => {
    setExpeditionError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setExpeditionError(null);
    }, 4500);
  };

  useEffect(() => {
    if (!expeditionOriginTileId) {
      setExpeditionError(null);
    }
  }, [expeditionOriginTileId]);

  // Centrar inicialmente en la capital o en la Península Ibérica
  useEffect(() => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current.getBoundingClientRect();

    let targetX = (GRID_COLS * TILE_BASE_SIZE) / 2;
    let targetY = (GRID_ROWS * TILE_BASE_SIZE) / 2;

    if (empire.capitalTileId) {
      const cap = geoGridService.getTile(empire.capitalTileId);
      if (cap) {
        targetX = cap.x * TILE_BASE_SIZE;
        targetY = cap.y * TILE_BASE_SIZE;
      }
    } else {
      const coords = geoGridService.lonLatToTileXY(-3.7, 40.4);
      targetX = coords.x * TILE_BASE_SIZE;
      targetY = coords.y * TILE_BASE_SIZE;
    }

    setCamera({
      x: width / 2 - targetX * 1.6,
      y: height / 2 - targetY * 1.6,
      zoom: 1.6
    });
  }, [empire.capitalTileId]);

  // Dibujar el mapa en Canvas a 60 FPS garantizados
  const renderMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { x: camX, y: camY, zoom } = camera;
    const tileSize = TILE_BASE_SIZE * zoom;

    // 1. Fondo de Océano
    ctx.fillStyle = '#080c16';
    ctx.fillRect(0, 0, width, height);

    // 2. Renderizado ultrarrápido del Mundo Estático (1 sola llamada GPU blit en 0.05ms)
    const baseCanvas = geoGridService.getBaseWorldCanvas();
    if (baseCanvas) {
      ctx.imageSmoothingEnabled = false; // Pixel art táctico super nítido
      ctx.drawImage(
        baseCanvas,
        camX,
        camY,
        GRID_COLS * tileSize,
        GRID_ROWS * tileSize
      );
    }

    // Viewport Culling para líneas de cuadrícula y elementos dinámicos
    const minCol = Math.max(0, Math.floor((-camX) / tileSize));
    const maxCol = Math.min(GRID_COLS - 1, Math.ceil((width - camX) / tileSize));
    const minRow = Math.max(0, Math.floor((-camY) / tileSize));
    const maxRow = Math.min(GRID_ROWS - 1, Math.ceil((height - camY) / tileSize));

    // Cuadrícula sutil solo visible cuando hay suficiente zoom para no saturar la vista
    if (zoom >= 2.0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 0.5;
      for (let c = minCol; c <= maxCol + 1; c++) {
        const sx = camX + c * tileSize;
        ctx.beginPath();
        ctx.moveTo(sx, Math.max(0, camY + minRow * tileSize));
        ctx.lineTo(sx, Math.min(height, camY + (maxRow + 1) * tileSize));
        ctx.stroke();
      }
      for (let r = minRow; r <= maxRow + 1; r++) {
        const sy = camY + r * tileSize;
        ctx.beginPath();
        ctx.moveTo(Math.max(0, camX + minCol * tileSize), sy);
        ctx.lineTo(Math.min(width, camX + (maxCol + 1) * tileSize), sy);
        ctx.stroke();
      }
    }

    // 3. Casillas adyacentes comprables (Azul sutil de expansión táctica)
    const buyableAdjacentIds = new Set<string>();
    if (empire.capitalTileId) {
      Object.keys(empire.colonizedTiles).forEach(ownedId => {
        const adjs = geoGridService.getAdjacentLandTiles(ownedId);
        adjs.forEach(adj => {
          if (!empire.colonizedTiles[adj.id]) {
            buyableAdjacentIds.add(adj.id);
          }
        });
      });

      ctx.fillStyle = '#1e385c';
      buyableAdjacentIds.forEach(id => {
        const tile = geoGridService.getTile(id);
        if (!tile) return;
        const sx = camX + tile.x * tileSize;
        const sy = camY + tile.y * tileSize;
        if (sx + tileSize < 0 || sx > width || sy + tileSize < 0 || sy > height) return;

        ctx.fillRect(sx, sy, tileSize, tileSize);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx, sy, tileSize, tileSize);
      });
    }

    // 4. Casillas colonizadas del Imperio del jugador
    Object.keys(empire.colonizedTiles).forEach(ownedId => {
      const colData = empire.colonizedTiles[ownedId];
      const tile = geoGridService.getTile(ownedId);
      if (!tile) return;
      const sx = camX + tile.x * tileSize;
      const sy = camY + tile.y * tileSize;
      if (sx + tileSize < 0 || sx > width || sy + tileSize < 0 || sy > height) return;

      // Relleno temático de la casilla según zonificación:
      // Granjas = Amarillo trigo, Bosques/Canteras = Verde, Ciudades = Tonos marrones terrosos por nivel
      const tileColor = getTileVisualColor(colData);
      ctx.fillStyle = tileColor;
      ctx.fillRect(sx, sy, tileSize, tileSize);

      // Borde exterior con el color de la bandera imperial para reconocer la frontera soberana
      ctx.strokeStyle = empire.colorHex;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx, sy, tileSize, tileSize);

      // Resalte exclusivo de la Capital Imperial (borde dorado doble)
      if (tile.id === empire.capitalTileId) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(sx + 0.5, sy + 0.5, tileSize - 1, tileSize - 1);
      } else if (colData?.settlementTier === 4) {
        // Resalte elegante de Megaciudad
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 0.5, sy + 0.5, tileSize - 1, tileSize - 1);
      }

      // Iconos de construcciones y emojis:
      // Solo se muestran si hay suficiente zoom y la casilla mide al menos 20px para que el emoji quepa con holgura y estética limpia.
      // Con zoom out (tileSize < 20) se muestran exclusivamente los colores temáticos para un mapa estratégico nítido y despejado.
      const canFitEmoji = tileSize >= 20;

      if (canFitEmoji) {
        let icon = '';
        const islandSpec = tile.islandGroupId ? empire.islandSpecializations?.[tile.islandGroupId] : null;

        if (colData?.role === 'settlement' || colData?.settlementTier) {
          if (islandSpec === 'tourist_resort') {
            icon = '🏖️';
          } else if (islandSpec === 'fiscal_paradise') {
            icon = '🏦';
          } else if (islandSpec === 'naval_hub') {
            icon = '⚓';
          } else {
            const tier = colData.settlementTier || 1;
            if (tier === 4 && colData.nationalWonderBuilt) {
              const wonder = getCountryWonder(tile.countryCode, tile.countryName);
              icon = wonder.icon;
            } else {
              icon = tier === 1 ? '⛺' : tier === 2 ? '🏡' : tier === 3 ? '🏙️' : '🌆';
            }
          }
        } else if (colData?.role === 'crops') {
          const rTier = colData.resourceTier || 1;
          icon = rTier === 3 ? '🌾³' : rTier === 2 ? '🌾²' : '🌾';
        } else if (colData?.role === 'resources') {
          const rTier = colData.resourceTier || 1;
          icon = rTier === 3 ? '🌲³' : rTier === 2 ? '🌲²' : '🌲';
        } else if (colData?.role === 'energy') icon = '⚡';
        else if (colData?.role === 'port') icon = '⚓';
        else if (colData?.role === 'hotel') icon = '🏖️';
        else if (colData?.role === 'bank') icon = '🏦';

        if (icon) {
          ctx.save();
          // Sombra de contraste para legibilidad nítida sobre fondos amarillos, verdes o grises
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 3;
          // Tamaño proporcional calibrado (0.65 de la celda) para mantener holgura y márgenes limpios
          const emojiSize = Math.max(12, Math.min(22, Math.floor(tileSize * 0.65)));
          ctx.font = `${emojiSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(icon, sx + tileSize / 2, sy + tileSize / 2 + 1);
          ctx.restore();

          // Si este asentamiento tiene puerto marítimo, dibujar ancla en esquina solo si la celda es amplia
          if (colData?.hasPort && tileSize >= 24) {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
            ctx.shadowBlur = 2;
            ctx.font = `${Math.max(9, Math.min(13, Math.floor(tileSize * 0.38)))}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚓', sx + tileSize * 0.8, sy + tileSize * 0.25);
            ctx.restore();
          }
        }
      }
    });

    // 4b. Fronteras internacionales gruesas sobre casillas colonizadas y de expansión táctica
    const borderEdges = new Set<string>();
    const tilesToCheck = new Set<string>(Object.keys(empire.colonizedTiles));
    if (empire.capitalTileId) {
      buyableAdjacentIds.forEach(id => tilesToCheck.add(id));
    }

    tilesToCheck.forEach(tileId => {
      const tile = geoGridService.getTile(tileId);
      if (!tile || !tile.countryCode) return;

      // Vecino Norte
      if (tile.y > 0) {
        const topTile = geoGridService.getTileByXY(tile.x, tile.y - 1);
        if (topTile && topTile.countryCode && topTile.countryCode !== tile.countryCode) {
          borderEdges.add(`H:${tile.x},${tile.y}`);
        }
      }
      // Vecino Sur
      if (tile.y + 1 < GRID_ROWS) {
        const bottomTile = geoGridService.getTileByXY(tile.x, tile.y + 1);
        if (bottomTile && bottomTile.countryCode && bottomTile.countryCode !== tile.countryCode) {
          borderEdges.add(`H:${tile.x},${tile.y + 1}`);
        }
      }
      // Vecino Oeste
      if (tile.x > 0) {
        const leftTile = geoGridService.getTileByXY(tile.x - 1, tile.y);
        if (leftTile && leftTile.countryCode && leftTile.countryCode !== tile.countryCode) {
          borderEdges.add(`V:${tile.x},${tile.y}`);
        }
      }
      // Vecino Este
      if (tile.x + 1 < GRID_COLS) {
        const rightTile = geoGridService.getTileByXY(tile.x + 1, tile.y);
        if (rightTile && rightTile.countryCode && rightTile.countryCode !== tile.countryCode) {
          borderEdges.add(`V:${tile.x + 1},${tile.y}`);
        }
      }
    });

    if (borderEdges.size > 0) {
      ctx.save();
      ctx.strokeStyle = '#000000';
      const borderThickness = Math.max(2.5, Math.min(4, Math.round(tileSize * 0.18)));
      ctx.lineWidth = borderThickness;
      ctx.lineCap = 'square';
      ctx.beginPath();

      borderEdges.forEach(edgeKey => {
        const type = edgeKey[0];
        const commaIdx = edgeKey.indexOf(',');
        const gx = parseInt(edgeKey.substring(2, commaIdx), 10);
        const gy = parseInt(edgeKey.substring(commaIdx + 1), 10);

        if (type === 'H') {
          const sx1 = camX + gx * tileSize;
          const sx2 = sx1 + tileSize;
          const sy = camY + gy * tileSize;
          if (sy >= -borderThickness && sy <= height + borderThickness && sx2 >= 0 && sx1 <= width) {
            ctx.moveTo(sx1, sy);
            ctx.lineTo(sx2, sy);
          }
        } else {
          const sx = camX + gx * tileSize;
          const sy1 = camY + gy * tileSize;
          const sy2 = sy1 + tileSize;
          if (sx >= -borderThickness && sx <= width + borderThickness && sy2 >= 0 && sy1 <= height) {
            ctx.moveTo(sx, sy1);
            ctx.lineTo(sx, sy2);
          }
        }
      });

      ctx.stroke();
      ctx.restore();
    }

    // 5. Casilla actualmente seleccionada (resaltado dorado brillante)
    if (selectedTile) {
      const sx = camX + selectedTile.x * tileSize;
      const sy = camY + selectedTile.y * tileSize;
      if (sx + tileSize >= 0 && sx <= width && sy + tileSize >= 0 && sy <= height) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(sx - 0.5, sy - 0.5, tileSize + 1, tileSize + 1);
      }

      // 5b. Radio de influencia de asentamiento (Mecánica Buscaminas GDD Fase 3)
      const selColData = empire.colonizedTiles[selectedTile.id];
      if (selColData?.role === 'settlement') {
        const tier = selColData.settlementTier || 1;
        const radius = tier === 1 ? 1 : tier === 2 ? 2 : 3;

        const minCol = Math.max(0, selectedTile.x - radius);
        const maxCol = Math.min(GRID_COLS - 1, selectedTile.x + radius);
        const minRow = Math.max(0, selectedTile.y - radius);
        const maxRow = Math.min(GRID_ROWS - 1, selectedTile.y + radius);

        const rx = camX + minCol * tileSize;
        const ry = camY + minRow * tileSize;
        const rw = (maxCol - minCol + 1) * tileSize;
        const rh = (maxRow - minRow + 1) * tileSize;

        ctx.save();
        // 1. Contorno oscuro base para contraste universal (se ve sobre cualquier color de imperio)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([]);
        ctx.strokeRect(rx, ry, rw, rh);

        // 2. Línea discontinua amarillo dorado eléctrico brillante (#facc15)
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(rx, ry, rw, rh);

        // Relleno ámbar translúcido
        ctx.fillStyle = 'rgba(250, 204, 21, 0.12)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.restore();
      }
    }

    const now = Date.now();

    // 6. Casilla sobre la que pasa el ratón (Hover highlight solicitado por el usuario)
    if (hoveredTile && (!selectedTile || hoveredTile.id !== selectedTile.id)) {
      const hx = camX + hoveredTile.x * tileSize;
      const hy = camY + hoveredTile.y * tileSize;
      if (hx + tileSize >= 0 && hx <= width && hy + tileSize >= 0 && hy <= height) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fillRect(hx, hy, tileSize, tileSize);
        ctx.strokeStyle = '#38bdf8'; // Resaltado cian visible
        ctx.lineWidth = 2;
        ctx.strokeRect(hx + 0.5, hy + 0.5, tileSize - 1, tileSize - 1);
      }
    }

    // 7. Modo Selección de Destino de Expedición Náutica
    if (expeditionOriginTileId) {
      const originTile = geoGridService.getTile(expeditionOriginTileId);
      if (originTile) {
        const maxRange = empireStorageService.getMaxNavalRange(expeditionOriginTileId);
        const ox = camX + (originTile.x + 0.5) * tileSize;
        const oy = camY + (originTile.y + 0.5) * tileSize;

        // Visualizar radio máximo del puerto
        if (isFinite(maxRange)) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ox, oy, maxRange * tileSize, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }

        if (hoveredTile) {
          const hx = camX + hoveredTile.x * tileSize;
          const hy = camY + hoveredTile.y * tileSize;

          if ((hoveredTile.isCoast || hoveredTile.isSmallIsland) && !empire.colonizedTiles[hoveredTile.id]) {
            const previewRoute = geoGridService.findSeaRoute(originTile.x, originTile.y, hoveredTile.x, hoveredTile.y);
            const inRange = previewRoute ? previewRoute.length <= maxRange : false;
            const lineColor = inRange ? '#10b981' : '#f43f5e';
            const fillColor = inRange ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)';

            ctx.save();
            if (previewRoute && previewRoute.length >= 2) {
              ctx.setLineDash([3, 4]);
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = 2;
              ctx.beginPath();
              previewRoute.forEach((pt, idx) => {
                const px = camX + (pt.x + 0.5) * tileSize;
                const py = camY + (pt.y + 0.5) * tileSize;
                if (idx === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              });
              ctx.stroke();
            }

            ctx.fillStyle = fillColor;
            ctx.fillRect(hx, hy, tileSize, tileSize);
            ctx.strokeStyle = lineColor;
            ctx.strokeRect(hx, hy, tileSize, tileSize);
            ctx.restore();
          }
        }
      }
    }

    // 8. Barcos Comerciales Ambientales (Tráfico marítimo orgánico y escalable)
    const allEmpirePorts = empireStorageService.getAllPorts();
    if (allEmpirePorts.length >= 2) {
      // Limpiar barcos que completaron su trayecto
      ambientShipsRef.current = ambientShipsRef.current.filter(s => now - s.startTime < s.durationMs);

      // Buscar pares de puertos que NO estén cerca (distancia mínima de 3x3 y al menos 6 celdas de mar)
      const validPortPairs: { pA: any; pB: any; dist: number }[] = [];
      for (let i = 0; i < allEmpirePorts.length; i++) {
        for (let j = i + 1; j < allEmpirePorts.length; j++) {
          const pA = allEmpirePorts[i];
          const pB = allEmpirePorts[j];
          const dx = Math.abs(pA.tile.x - pB.tile.x);
          const dy = Math.abs(pA.tile.y - pB.tile.y);

          if (dx <= 3 && dy <= 3) continue;

          const dist = Math.hypot(dx, dy);
          if (dist >= 6) {
            validPortPairs.push({ pA, pB, dist });
          }
        }
      }

      // Máximo escalable según tamaño del imperio: mantenerlo tranquilo y de chill
      const maxAmbientShips = Math.min(3, Math.max(1, Math.floor(allEmpirePorts.length / 2)));

      // Lanzar un barquito comercial de forma espaciada (cada 25-30s)
      if (validPortPairs.length > 0 && now - lastAmbientSpawnRef.current > 25000 && ambientShipsRef.current.length < maxAmbientShips) {
        lastAmbientSpawnRef.current = now;
        const chosen = validPortPairs[Math.floor(Math.random() * validPortPairs.length)];
        const route = geoGridService.findSeaRoute(chosen.pA.tile.x, chosen.pA.tile.y, chosen.pB.tile.x, chosen.pB.tile.y);

        if (route && route.length >= 4) {
          // Velocidad relajada y placentera: ~1.3s por celda navegada (mínimo 32s, máximo 80s)
          const durationMs = Math.min(80000, Math.max(32000, route.length * 1300));
          ambientShipsRef.current.push({
            id: `amb_${now}`,
            originCoords: { x: chosen.pA.tile.x, y: chosen.pA.tile.y },
            destCoords: { x: chosen.pB.tile.x, y: chosen.pB.tile.y },
            startTime: now,
            durationMs,
            route
          });
        }
      }

      // Dibujar cada barco ambiental con su estela de puntitos blanca sobre su ruta marina
      ambientShipsRef.current.forEach(ship => {
        const progress = Math.min(1, Math.max(0, (now - ship.startTime) / ship.durationMs));
        drawNauticalCurveAndShip(
          ctx,
          ship.originCoords,
          ship.destCoords,
          progress,
          camX,
          camY,
          tileSize,
          now,
          undefined,
          true,
          ship.route
        );
      });
    }

    // 9. Expediciones Marítimas del Jugador (Navegación A*, estela persistente y borrado desde el origen tras llegada)
    const visibleExps = (empire.expeditions || []).filter(
      e => e.status === 'sailing' || (e.status === 'arrived' && e.completedAt && now - e.completedAt < 5000)
    );

    visibleExps.forEach(exp => {
      let progress = 1;
      let label: string | undefined = undefined;

      if (exp.status === 'sailing') {
        if (now >= exp.arrivalTime) {
          progress = 1;
        } else {
          progress = Math.min(1, Math.max(0, (now - exp.departureTime) / (exp.arrivalTime - exp.departureTime)));
          const remainingSec = Math.max(0, Math.ceil((exp.arrivalTime - now) / 1000));
          label = `${remainingSec}s`;
        }
      }

      drawNauticalCurveAndShip(
        ctx,
        exp.originCoords,
        exp.destCoords,
        progress,
        camX,
        camY,
        tileSize,
        now,
        label,
        false,
        exp.route,
        exp.completedAt
      );

      // Efecto de halo pulsante en la costa de destino elegida mientras navega
      if (exp.status === 'sailing') {
        const destSx = camX + exp.destCoords.x * tileSize;
        const destSy = camY + exp.destCoords.y * tileSize;
        if (destSx + tileSize >= 0 && destSx <= width && destSy + tileSize >= 0 && destSy <= height) {
          const pulse = (Math.sin(now / 180) + 1) * 0.5;
          ctx.save();
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.6})`;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(destSx, destSy, tileSize, tileSize);
          ctx.fillStyle = `rgba(56, 189, 248, ${0.1 + pulse * 0.2})`;
          ctx.fillRect(destSx, destSy, tileSize, tileSize);
          ctx.restore();
        }
      }
    });
  }, [camera, empire, selectedTile, hoveredTile, expeditionOriginTileId]);

  // Redimensionar canvas automáticamente
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      renderMap();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [renderMap]);

  // Loop de animación a 60 FPS garantizados (para mover los barquitos y estelas suavemente)
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderMap();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderMap]);

  // Controles de Ratón: Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
      }

      setCamera(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));

      dragStart.current = { x: e.clientX, y: e.clientY };
      return; // No recalcular hover mientras se arrastra la pantalla para máxima fluidez
    }

    // Detectar casilla sobre la que pasa el ratón (Hover) solo si el ratón está quieto/inspeccionando
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const tileSize = TILE_BASE_SIZE * camera.zoom;
      const tileCol = Math.floor((clickX - camera.x) / tileSize);
      const tileRow = Math.floor((clickY - camera.y) / tileSize);

      const tile = geoGridService.getTileByXY(tileCol, tileRow) || null;
      if (tile?.id !== hoveredTileRef.current?.id) {
        hoveredTileRef.current = tile;
        setHoveredTile(tile);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    isDragging.current = false;

    if (!hasMoved.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const tileSize = TILE_BASE_SIZE * camera.zoom;
      const tileCol = Math.floor((clickX - camera.x) / tileSize);
      const tileRow = Math.floor((clickY - camera.y) / tileSize);

      const clickedTile = geoGridService.getTileByXY(tileCol, tileRow);

      // Si estamos en modo de selección de destino de expedición marítima (Elegir en Mapa):
      if (expeditionOriginTileId) {
        if (!clickedTile) {
          triggerExpeditionError('Has hecho clic en el océano. Debes seleccionar una costa de tierra firme o isla.');
          return;
        }

        if (empire.colonizedTiles[clickedTile.id]) {
          triggerExpeditionError('Esta casilla ya pertenece a tu imperio. Selecciona una costa libre en ultramar.');
          return;
        }

        if (!clickedTile.isCoast && !clickedTile.isSmallIsland) {
          triggerExpeditionError('Esta casilla está en el interior. Las expediciones marítimas solo desembarcan en costas o islas.');
          return;
        }

        const originTile = geoGridService.getTile(expeditionOriginTileId);
        if (originTile && clickedTile.countryCode === originTile.countryCode && !clickedTile.isSmallIsland) {
          triggerExpeditionError(`No puedes enviar barcos dentro del mismo país continental (${originTile.countryName || 'origen'}). Elige otro país o una isla.`);
          return;
        }

        const routeParams = empireStorageService.calculateExpeditionParams(expeditionOriginTileId, clickedTile.id);
        if (!routeParams) {
          triggerExpeditionError('No existe una ruta marítima navegable hacia esta costa.');
          return;
        }

        if (routeParams.outOfRange) {
          const maxR = isFinite(routeParams.maxRange) ? `${routeParams.maxRange} casillas` : 'Ilimitado';
          triggerExpeditionError(`Destino fuera de alcance (${routeParams.distance} casillas, máx: ${maxR}). Establece un Hub Naval intermedio.`);
          return;
        }

        // Destino completamente válido
        setExpeditionError(null);
        if (onSelectExpeditionDest) {
          onSelectExpeditionDest(clickedTile.id);
        }
        return;
      }

      if (clickedTile) {
        onSelectTile(clickedTile);
        if (!empire.capitalTileId) {
          onRequestFoundCapital(clickedTile);
        }
      } else {
        onSelectTile(null);
      }
    }
  };

  // Zoom con Rueda centrado en el cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.18 : 0.85;
    const newZoom = Math.max(0.4, Math.min(6.0, camera.zoom * zoomFactor));

    setCamera(prev => ({
      zoom: newZoom,
      x: cursorX - (cursorX - prev.x) * (newZoom / prev.zoom),
      y: cursorY - (cursorY - prev.y) * (newZoom / prev.zoom)
    }));
  };

  // Menú Rápido Flotante de Construcción Inmediata sobre la casilla pulsada
  const isAdjacentToOwned = Boolean(
    selectedTile &&
    geoGridService.getAdjacentLandTiles(selectedTile.id).some(adj => empire.colonizedTiles[adj.id])
  );

  const canQuickBuild = Boolean(
    empire.capitalTileId &&
    selectedTile &&
    !expeditionOriginTileId &&
    !empire.colonizedTiles[selectedTile.id] &&
    isAdjacentToOwned
  );

  // Lógica de Islas pequeñas (solo 1 asentamiento por grupo de isla)
  const islandTiles = selectedTile?.islandGroupId ? geoGridService.getTilesByIslandGroup(selectedTile.islandGroupId) : [];
  const islandSettlement = islandTiles.find(t => {
    const col = empire.colonizedTiles[t.id];
    return col && (col.role === 'settlement' || (col.settlementTier && col.settlementTier > 0));
  });
  const isSecondaryIslandTile = Boolean(selectedTile?.isSmallIsland && islandSettlement && islandSettlement.id !== selectedTile?.id);

  const nextTileCost = canQuickBuild ? empireStorageService.getNextTileCost() : 0;
  const hasCoins = empire.coins >= nextTileCost;
  const hasMaterialsForVillage = empire.nationalMaterials >= 15;
  const hasFoodForVillage = empire.nationalFood >= 7;

  const canBuildSettlement = !isSecondaryIslandTile && hasCoins && hasMaterialsForVillage && hasFoodForVillage;
  const canBuildCrops = hasCoins;
  const canBuildResources = hasCoins;

  const handleQuickBuild = (role: 'settlement' | 'crops' | 'resources') => {
    if (!selectedTile) return;
    if (empireStorageService.buyTile(selectedTile.id, role)) {
      empireSound.playBuild();
      try {
        localStorage.setItem('geostrike_last_annex_role', role);
      } catch {
        // ignore
      }
    }
  };

  // Coordenadas en pantalla de la casilla seleccionada para el menú flotante
  const currentTileSize = TILE_BASE_SIZE * camera.zoom;
  const screenTileX = selectedTile ? camera.x + (selectedTile.x + 0.5) * currentTileSize : 0;
  const screenTileY = selectedTile ? camera.y + selectedTile.y * currentTileSize : 0;
  const canvasW = canvasRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 800);
  const canvasH = canvasRef.current?.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);

  const isQuickMenuVisible = canQuickBuild && (
    screenTileX >= -100 &&
    screenTileX <= canvasW + 100 &&
    screenTileY >= -100 &&
    screenTileY <= canvasH + 100
  );

  const isNearTopEdge = screenTileY < 65;
  const clampedX = Math.max(90, Math.min(canvasW - 90, screenTileX));
  const quickMenuTop = isNearTopEdge ? screenTileY + currentTileSize + 10 : screenTileY - 10;
  const quickMenuTransform = isNearTopEdge ? 'translate(-50%, 0)' : 'translate(-50%, -100%)';

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-zinc-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Indicador de País bajo el cursor (Hover) - Centrado arriba */}
      {hoveredTile && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-zinc-950/90 border border-zinc-700/80 px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md pointer-events-none z-20 flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-xs sm:text-sm font-black text-white tracking-wide">
            {hoveredTile.countryName || 'Territorio Libre'}
          </span>
          {hoveredTile.countryCode && (
            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700">
              {hoveredTile.countryCode}
            </span>
          )}
          <div className="h-3 w-px bg-zinc-700/80" />
          <span className="text-[11px] text-zinc-400 font-mono">
            {hoveredTile.lat.toFixed(1)}°, {hoveredTile.lon.toFixed(1)}°
          </span>
          {hoveredTile.isCoast && (
            <span className="text-[10px] text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded border border-cyan-500/25">
              🌊 Costa
            </span>
          )}
          {empire.colonizedTiles[hoveredTile.id] && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25 font-bold">
              ✓ Tu Imperio
            </span>
          )}
        </div>
      )}

      {/* Controles de Zoom en Pantalla */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl shadow-xl z-20 backdrop-blur-sm">
        <button
          onClick={() => setCamera(prev => ({ ...prev, zoom: Math.min(6.0, prev.zoom * 1.3) }))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-lg transition-colors"
          title="Acercar mapa"
        >
          +
        </button>
        <button
          onClick={() => setCamera(prev => ({ ...prev, zoom: Math.max(0.4, prev.zoom / 1.3) }))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-lg transition-colors"
          title="Alejar mapa"
        >
          -
        </button>
        <button
          onClick={() => {
            if (!canvasRef.current) return;
            const { width, height } = canvasRef.current.getBoundingClientRect();
            if (empire.capitalTileId) {
              const cap = geoGridService.getTile(empire.capitalTileId);
              if (cap) {
                setCamera({
                  x: width / 2 - cap.x * TILE_BASE_SIZE * 2.0,
                  y: height / 2 - cap.y * TILE_BASE_SIZE * 2.0,
                  zoom: 2.0
                });
              }
            }
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors"
          title="Centrar en la Capital"
        >
          <Compass className="w-4 h-4 text-indigo-400" />
        </button>
      </div>

      {/* Banner de Modo Navegación / Fletar Barco */}
      {expeditionOriginTileId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-xl w-full px-4 z-30 pointer-events-auto select-none">
          <div className={`px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 border transition-all duration-200 ${
            expeditionError 
              ? 'bg-red-950/95 border-red-500/80 text-red-200 animate-shake' 
              : 'bg-blue-950/95 border-blue-400 text-blue-100 animate-pulse'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {expeditionError ? (
                <span className="text-base shrink-0">⚠️</span>
              ) : (
                <Anchor className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-bold truncate">
                {expeditionError || 'Haz clic en una costa libre de otro país o isla para enviar tu barco'}
              </span>
            </div>
            {onCancelExpeditionMode && (
              <button
                onClick={() => {
                  setExpeditionError(null);
                  onCancelExpeditionMode();
                }}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors shrink-0 border border-zinc-700"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guía Flotante Inicial para Nuevos Jugadores */}
      {!empire.capitalTileId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 z-20">
          <Compass className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            Haz clic en cualquier país del mundo para fundar tu Capital
          </span>
        </div>
      )}

      {/* Menú Rápido Flotante de Construcción Inmediata */}
      {isQuickMenuVisible && selectedTile && (
        <div
          style={{
            left: `${clampedX}px`,
            top: `${quickMenuTop}px`,
            transform: quickMenuTransform,
          }}
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
          className="absolute z-30 flex items-center gap-1.5 px-2 py-1.5 bg-zinc-950/95 border border-zinc-700/90 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Flecha indicadora apuntando hacia la casilla */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-950 rotate-45 pointer-events-none ${
              isNearTopEdge
                ? '-top-1.5 border-l border-t border-zinc-700/90'
                : '-bottom-1.5 border-r border-b border-zinc-700/90'
            }`}
          />

          {/* Coste en monedas */}
          <div
            className="flex items-center gap-1 px-2 py-1 bg-zinc-900/90 border border-zinc-800 rounded-xl text-[11px] font-mono font-bold text-amber-300 shadow-inner shrink-0"
            title={`Coste de anexión: ${nextTileCost} monedas`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{nextTileCost}</span>
          </div>

          {/* Separador */}
          <div className="w-px h-5 bg-zinc-800 shrink-0" />

          {/* Botones de Construcción Rápida: Poblado ⛺, Huerto 🌾, Cantera 🌲 */}
          <div className="flex items-center gap-1">
            {/* 1. Poblado ⛺ */}
            {!isSecondaryIslandTile && (
              <button
                type="button"
                onClick={() => handleQuickBuild('settlement')}
                disabled={!canBuildSettlement}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
                  canBuildSettlement
                    ? 'bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-200 shadow-sm hover:scale-110 active:scale-95 cursor-pointer'
                    : 'bg-zinc-900/40 border border-zinc-800/60 opacity-35 cursor-not-allowed text-zinc-500'
                }`}
                title={
                  canBuildSettlement
                    ? `Fundar Poblado ⛺ (+15 Hab, -15🧱, coste: ${nextTileCost}🪙)`
                    : !hasCoins
                    ? `Faltan monedas (${empire.coins}/${nextTileCost}🪙)`
                    : !hasMaterialsForVillage
                    ? `Faltan materiales (${empire.nationalMaterials}/15🧱)`
                    : `Comida insuficiente (+${empire.nationalFood}/7🌾)`
                }
              >
                <span>⛺</span>
              </button>
            )}

            {/* 2. Huerto Agrícola 🌾 */}
            <button
              type="button"
              onClick={() => handleQuickBuild('crops')}
              disabled={!canBuildCrops}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
                canBuildCrops
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 shadow-sm hover:scale-110 active:scale-95 cursor-pointer'
                  : 'bg-zinc-900/40 border border-zinc-800/60 opacity-35 cursor-not-allowed text-zinc-500'
              }`}
              title={
                canBuildCrops
                  ? `Construir Huerto Agrícola 🌾 (+15🌾/turno, coste: ${nextTileCost}🪙)`
                  : `Faltan monedas (${empire.coins}/${nextTileCost}🪙)`
              }
            >
              <span>🌾</span>
            </button>

            {/* 3. Cantera / Bosque 🌲 */}
            <button
              type="button"
              onClick={() => handleQuickBuild('resources')}
              disabled={!canBuildResources}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
                canBuildResources
                  ? 'bg-orange-500/15 hover:bg-orange-500/30 border border-orange-500/50 hover:border-orange-400 text-orange-200 shadow-sm hover:scale-110 active:scale-95 cursor-pointer'
                  : 'bg-zinc-900/40 border border-zinc-800/60 opacity-35 cursor-not-allowed text-zinc-500'
              }`}
              title={
                canBuildResources
                  ? `Construir Cantera / Bosque 🌲 (+20🧱 fijos, coste: ${nextTileCost}🪙)`
                  : `Faltan monedas (${empire.coins}/${nextTileCost}🪙)`
              }
            >
              <span>🌲</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
