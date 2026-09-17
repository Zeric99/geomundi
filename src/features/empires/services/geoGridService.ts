import * as topojson from 'topojson-client';
import * as d3Geo from 'd3-geo';
import { GridTile } from '../types';
import { mapPreloadService } from '../../../services/mapPreloadService';
import { FALLBACK_COUNTRIES } from '../../../data/fallbackCountries';
import { NUMERIC_TO_CCA3 } from '../../../data/geoAliases';

export const GRID_COLS = 720; // 0.5 grados de longitud (-180 a +180)
export const GRID_ROWS = 300; // De 80°N a -70°S (0.5 grados de latitud)
export const LAT_MAX = 80;
export const LAT_MIN = -70;

// Micropaíses y territorios superenanos excluidos para evitar ruido, errores y artefactos
const EXCLUDED_MICROSTATES = new Set([
  'AND', // Andorra
  'VAT', // Vaticano
  'MCO', // Mónaco
  'SMR', // San Marino
  'LIE', // Liechtenstein
  'GIB', // Gibraltar
  'MLT', // Malta
  'FRO', // Islas Feroe
  'AIA', 'BMU', 'CYM', 'MSR', 'BLM', 'MAF', 'SXM', 'VGB', 'VIR',
  'TUV', 'NRU', 'NIU', 'TKL', 'PCN', 'NFK', 'CXR', 'CCK', 'SHN'
]);

interface TempTileData {
  cca3: string;
  countryName: string;
}

export class GeoGridService {
  private tilesMap: Map<string, GridTile> = new Map();
  private tilesArray: (GridTile | null)[] = new Array(GRID_COLS * GRID_ROWS).fill(null);
  private landTilesList: GridTile[] = [];
  private countryTileCounts: Map<string, number> = new Map();
  private baseWorldCanvas: HTMLCanvasElement | null = null;
  private countryBordersGeo: any = null; // GeoJSON MultiLineString de fronteras entre países
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  public lonLatToTileXY(lon: number, lat: number): { x: number; y: number } {
    const x = Math.floor(((lon + 180) / 360) * GRID_COLS);
    const y = Math.floor(((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * GRID_ROWS);
    return {
      x: Math.max(0, Math.min(GRID_COLS - 1, x)),
      y: Math.max(0, Math.min(GRID_ROWS - 1, y))
    };
  }

  public tileXYToLonLat(x: number, y: number): { lon: number; lat: number } {
    const lon = (x / GRID_COLS) * 360 - 180 + 0.25;
    const lat = LAT_MAX - (y / GRID_ROWS) * (LAT_MAX - LAT_MIN) - 0.25;
    return { lon, lat };
  }

  public async initializeGrid(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const topoData = await mapPreloadService.getMapData();
        if (!topoData || !topoData.objects || !topoData.objects.countries) {
          console.warn('[GeoGridService] world-50m.json no disponible.');
          this.isInitialized = true;
          return;
        }

        const countriesGeo = topojson.feature(topoData, topoData.objects.countries) as any;

        // Mapeo exhaustivo de códigos y nombres en español
        const countryInfoMap = new Map<string, { cca3: string; nameEs: string }>();
        FALLBACK_COUNTRIES.forEach(c => {
          countryInfoMap.set(c.cca3, { cca3: c.cca3, nameEs: c.nameEs });
          if (c.ccn3) {
            countryInfoMap.set(c.ccn3.padStart(3, '0'), { cca3: c.cca3, nameEs: c.nameEs });
            countryInfoMap.set(c.ccn3, { cca3: c.cca3, nameEs: c.nameEs });
          }
        });

        // Fronteras oficiales entre países para referencia
        try {
          this.countryBordersGeo = topojson.mesh(
            topoData,
            topoData.objects.countries,
            (a: any, b: any) => a !== b
          );
        } catch (e) {
          console.warn('[GeoGridService] No se pudo generar malla de fronteras:', e);
        }

        // Crear Canvas Offscreen para comprobaciones exactas isPointInPath
        const offCanvas = document.createElement('canvas');
        offCanvas.width = GRID_COLS;
        offCanvas.height = GRID_ROWS;
        const ctx = offCanvas.getContext('2d');

        if (!ctx) {
          this.isInitialized = true;
          return;
        }

        const projection = d3Geo.geoEquirectangular()
          .fitExtent([[0, 0], [GRID_COLS, GRID_ROWS]], {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', geometry: { type: 'Point', coordinates: [-180, LAT_MAX] }, properties: {} },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [180, LAT_MIN] }, properties: {} }
            ]
          } as any);

        const pathGen = d3Geo.geoPath(projection, ctx);
        const rawGrid: (TempTileData | null)[] = new Array(GRID_COLS * GRID_ROWS).fill(null);
        const features = countriesGeo.features || [];

        // 1. Rasterizar país por país con isPointInPath (exacto, sin anti-aliasing ni mezcla de colores)
        for (let i = 0; i < features.length; i++) {
          const feat = features[i];
          const rawId = String(feat.id || '');
          const paddedId = rawId.padStart(3, '0');
          const cca3 = NUMERIC_TO_CCA3[paddedId] || NUMERIC_TO_CCA3[rawId] || feat.properties?.iso_a3 || feat.properties?.adm0_a3 || rawId;

          // Descartar micropaíses superenanos (Andorra, Vaticano, Mónaco, etc.)
          if (EXCLUDED_MICROSTATES.has(cca3)) {
            continue;
          }

          const info = countryInfoMap.get(cca3) || countryInfoMap.get(paddedId);
          const countryName = info?.nameEs || feat.properties?.name || feat.properties?.name_es || cca3;

          ctx.beginPath();
          pathGen(feat);

          let bounds: [[number, number], [number, number]];
          try {
            bounds = d3Geo.geoBounds(feat);
          } catch {
            bounds = [[-180, LAT_MIN], [180, LAT_MAX]];
          }

          let [minLon, minLat] = bounds[0];
          let [maxLon, maxLat] = bounds[1];

          if (isNaN(minLon) || isNaN(maxLon)) {
            minLon = -180;
            maxLon = 180;
            minLat = LAT_MIN;
            maxLat = LAT_MAX;
          }

          const spansAntimeridian = minLon > maxLon;

          const rasterizeBounds = (w0: number, w1: number) => {
            const x0 = Math.max(0, Math.floor(((w0 + 180) / 360) * GRID_COLS) - 1);
            const x1 = Math.min(GRID_COLS - 1, Math.ceil(((w1 + 180) / 360) * GRID_COLS) + 1);
            const y0 = Math.max(0, Math.floor(((LAT_MAX - maxLat) / (LAT_MAX - LAT_MIN)) * GRID_ROWS) - 1);
            const y1 = Math.min(GRID_ROWS - 1, Math.ceil(((LAT_MAX - minLat) / (LAT_MAX - LAT_MIN)) * GRID_ROWS) + 1);

            for (let y = y0; y <= y1; y++) {
              for (let x = x0; x <= x1; x++) {
                if (ctx.isPointInPath(x + 0.5, y + 0.5)) {
                  rawGrid[y * GRID_COLS + x] = {
                    cca3,
                    countryName
                  };
                }
              }
            }
          };

          if (spansAntimeridian) {
            rasterizeBounds(minLon, 180);
            rasterizeBounds(-180, maxLon);
          } else {
            rasterizeBounds(minLon, maxLon);
          }
        }

        // 2. Preservar pasos marítimos críticos (Estrecho de Gibraltar / Cádiz y Canal de la Mancha)
        // Estrecho de Gibraltar: lon -6.2° a -4.8° -> x: 347..351. Fila 88 es agua entre España (fila 87) y Marruecos (fila 89).
        for (let gx = 347; gx <= 351; gx++) {
          rawGrid[88 * GRID_COLS + gx] = null; // Agua en el Estrecho de Gibraltar
        }

        // Canal de la Mancha: asegurar que ninguna celda de Reino Unido toque directamente a Francia por tierra
        for (let cx = 360; cx <= 365; cx++) {
          const ukTile = rawGrid[57 * GRID_COLS + cx];
          const frTile = rawGrid[58 * GRID_COLS + cx];
          if (ukTile?.cca3 === 'GBR' && frTile?.cca3 === 'FRA') {
            rawGrid[58 * GRID_COLS + cx] = null; // Separación por agua
          }
        }

        // 3. Fusión de países diminutos (< 3 casillas) en el país vecino predominante
        const countryCounts = new Map<string, number>();
        for (let i = 0; i < rawGrid.length; i++) {
          const item = rawGrid[i];
          if (item) {
            countryCounts.set(item.cca3, (countryCounts.get(item.cca3) || 0) + 1);
          }
        }

        for (let y = 0; y < GRID_ROWS; y++) {
          for (let x = 0; x < GRID_COLS; x++) {
            const idx = y * GRID_COLS + x;
            const item = rawGrid[idx];
            if (item && (countryCounts.get(item.cca3) || 0) < 3) {
              const neighbors = [
                rawGrid[y * GRID_COLS + (x + 1)],
                rawGrid[y * GRID_COLS + (x - 1)],
                rawGrid[(y + 1) * GRID_COLS + x],
                rawGrid[(y - 1) * GRID_COLS + x]
              ];
              const validNeighbor = neighbors.find(n => n && n.cca3 !== item.cca3);
              if (validNeighbor) {
                rawGrid[idx] = { ...validNeighbor };
              } else {
                rawGrid[idx] = null;
              }
            }
          }
        }

        // 4. Construir objetos GridTile limpios
        const tempTiles = new Map<string, GridTile>();
        const tempArray: (GridTile | null)[] = new Array(GRID_COLS * GRID_ROWS).fill(null);

        for (let y = 0; y < GRID_ROWS; y++) {
          for (let x = 0; x < GRID_COLS; x++) {
            const idx = y * GRID_COLS + x;
            const item = rawGrid[idx];
            if (item) {
              const { lon, lat } = this.tileXYToLonLat(x, y);
              const tileId = `${x},${y}`;

              const tile: GridTile = {
                id: tileId,
                x,
                y,
                lat,
                lon,
                countryCode: item.cca3,
                countryName: item.countryName,
                terrainType: 'plain',
                isCoast: false,
                isSmallIsland: false
              };

              tempTiles.set(tileId, tile);
              tempArray[idx] = tile;
            }
          }
        }

        // 5. Detección de Costas
        tempTiles.forEach((tile) => {
          const neighbors = [
            tempArray[tile.y * GRID_COLS + (tile.x + 1)],
            tempArray[tile.y * GRID_COLS + (tile.x - 1)],
            tempArray[(tile.y + 1) * GRID_COLS + tile.x],
            tempArray[(tile.y - 1) * GRID_COLS + tile.x]
          ];
          tile.isCoast = neighbors.some(n => n === null || n === undefined);
        });

        // 6. Detección de Islas Pequeñas (bloques <= 12 casillas)
        const visited = new Set<string>();
        let islandCounter = 1;

        tempTiles.forEach((startTile) => {
          if (visited.has(startTile.id)) return;

          const group: GridTile[] = [];
          const queue: GridTile[] = [startTile];
          visited.add(startTile.id);

          while (queue.length > 0) {
            const current = queue.shift()!;
            group.push(current);

            for (let dx = -1; dx <= 1; dx++) {
              for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nx = current.x + dx;
                const ny = current.y + dy;
                if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) continue;
                const neighbor = tempArray[ny * GRID_COLS + nx];
                if (neighbor && !visited.has(neighbor.id)) {
                  visited.add(neighbor.id);
                  queue.push(neighbor);
                }
              }
            }
          }

          if (group.length <= 45) {
            const groupId = `island_${islandCounter++}`;
            group.forEach(t => {
              t.isSmallIsland = true;
              t.islandGroupId = groupId;
            });
          }
        });

        this.tilesMap = tempTiles;
        this.tilesArray = tempArray;
        this.landTilesList = Array.from(tempTiles.values());

        // Conteo oficial de casillas por país
        this.countryTileCounts.clear();
        for (let i = 0; i < this.landTilesList.length; i++) {
          const c = this.landTilesList[i].countryCode;
          if (c) {
            this.countryTileCounts.set(c, (this.countryTileCounts.get(c) || 0) + 1);
          }
        }

        // 7. Pre-renderizar Canvas Base del Mundo para 60 FPS
        this.preRenderBaseWorldCanvas();

        this.isInitialized = true;
        console.log(`[GeoGridService] Cuadrícula inicializada: ${this.landTilesList.length} casillas de tierra.`);
      } catch (err) {
        console.error('[GeoGridService] Error al inicializar:', err);
        this.isInitialized = true;
      }
    })();

    return this.initPromise;
  }

  /**
   * Pre-renderiza todo el mapa del mundo estático (tierra uniforme + fronteras limpias)
   * en un Canvas 2D en memoria. Permite que durante el arrastre/zoom el renderizado sea 1 sola llamada GPU.
   */
  private preRenderBaseWorldCanvas(): void {
    const SCALE = 2; // Resolución x2 para máxima nitidez al hacer zoom
    const canvas = document.createElement('canvas');
    canvas.width = GRID_COLS * SCALE;
    canvas.height = GRID_ROWS * SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo del mar
    ctx.fillStyle = '#080c16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pintar tierra neutra uniforme
    ctx.fillStyle = '#182438';
    for (let i = 0; i < this.landTilesList.length; i++) {
      const tile = this.landTilesList[i];
      ctx.fillRect(tile.x * SCALE, tile.y * SCALE, SCALE, SCALE);
    }

    // Dibujar fronteras nítidas entre países diferentes
    ctx.fillStyle = '#64748b'; // Color elegante de frontera
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const tile = this.tilesArray[y * GRID_COLS + x];
        if (!tile) continue;

        // Frontera derecha
        const right = x + 1 < GRID_COLS ? this.tilesArray[y * GRID_COLS + (x + 1)] : null;
        if (right && right.countryCode !== tile.countryCode) {
          ctx.fillRect((x + 1) * SCALE - 0.5, y * SCALE, 1, SCALE);
        }

        // Frontera inferior
        const bottom = y + 1 < GRID_ROWS ? this.tilesArray[(y + 1) * GRID_COLS + x] : null;
        if (bottom && bottom.countryCode !== tile.countryCode) {
          ctx.fillRect(x * SCALE, (y + 1) * SCALE - 0.5, SCALE, 1);
        }
      }
    }

    this.baseWorldCanvas = canvas;
  }

  public getBaseWorldCanvas(): HTMLCanvasElement | null {
    return this.baseWorldCanvas;
  }

  public getTile(id: string): GridTile | undefined {
    return this.tilesMap.get(id);
  }

  public getTileByXY(x: number, y: number): GridTile | undefined {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return undefined;
    return this.tilesArray[y * GRID_COLS + x] || undefined;
  }

  public getAllLandTiles(): GridTile[] {
    return this.landTilesList;
  }

  public getCountryTotalTiles(countryCode: string): number {
    return this.countryTileCounts.get(countryCode) || 0;
  }

  public getTilesByIslandGroup(groupId: string): GridTile[] {
    return this.landTilesList.filter(t => t.islandGroupId === groupId);
  }

  public getCountryBordersGeo(): any {
    return this.countryBordersGeo;
  }

  public isWaterTile(x: number, y: number): boolean {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
    return this.tilesArray[y * GRID_COLS + x] === null;
  }

  public getAdjacentWaterTiles(x: number, y: number): { x: number; y: number }[] {
    const neighbors: { x: number; y: number }[] = [];
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (this.isWaterTile(nx, ny)) {
        if (dx !== 0 && dy !== 0) {
          const side1 = this.isWaterTile(x + dx, y);
          const side2 = this.isWaterTile(x, y + dy);
          if (!side1 && !side2) continue; // Evitar corte diagonal entre dos esquinas de tierra
        }
        neighbors.push({ x: nx, y: ny });
      }
    }
    return neighbors;
  }

  /**
   * Encuentra una ruta marítima real mediante A* navegando exclusivamente sobre cuadrículas de agua.
   * Contornea costas, cabos y estrechos sin jamás pisar tierra firme.
   */
  public findSeaRoute(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): { x: number; y: number }[] | null {
    // Si el origen o destino es tierra, buscar su casilla de agua más cercana
    let startWaterNodes = this.isWaterTile(startX, startY)
      ? [{ x: startX, y: startY }]
      : this.getAdjacentWaterTiles(startX, startY);

    let endWaterNodes = this.isWaterTile(endX, endY)
      ? [{ x: endX, y: endY }]
      : this.getAdjacentWaterTiles(endX, endY);

    if (startWaterNodes.length === 0) startWaterNodes = [{ x: startX, y: startY }];
    if (endWaterNodes.length === 0) endWaterNodes = [{ x: endX, y: endY }];

    // Elegir el par de inicio y meta con menor distancia euclídea
    let bestStart = startWaterNodes[0];
    let bestEnd = endWaterNodes[0];
    let minD = Infinity;

    for (const s of startWaterNodes) {
      for (const e of endWaterNodes) {
        const d = (s.x - e.x) ** 2 + (s.y - e.y) ** 2;
        if (d < minD) {
          minD = d;
          bestStart = s;
          bestEnd = e;
        }
      }
    }

    if (bestStart.x === bestEnd.x && bestStart.y === bestEnd.y) {
      return [{ x: startX, y: startY }, bestStart, { x: endX, y: endY }];
    }

    // A* Pathfinding optimizado con Min-Heap
    const heap: { x: number; y: number; f: number; g: number; key: string }[] = [];
    const pushHeap = (node: { x: number; y: number; f: number; g: number; key: string }) => {
      heap.push(node);
      let i = heap.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (heap[p].f <= heap[i].f) break;
        const tmp = heap[p];
        heap[p] = heap[i];
        heap[i] = tmp;
        i = p;
      }
    };

    const popHeap = () => {
      if (heap.length === 0) return null;
      const top = heap[0];
      const bottom = heap.pop()!;
      if (heap.length > 0) {
        heap[0] = bottom;
        let i = 0;
        const len = heap.length;
        while (true) {
          const left = (i << 1) + 1;
          const right = left + 1;
          let smallest = i;
          if (left < len && heap[left].f < heap[smallest].f) smallest = left;
          if (right < len && heap[right].f < heap[smallest].f) smallest = right;
          if (smallest === i) break;
          const tmp = heap[i];
          heap[i] = heap[smallest];
          heap[smallest] = tmp;
          i = smallest;
        }
      }
      return top;
    };

    const closedSet = new Set<string>();
    const gScores = new Map<string, number>();
    const cameFrom = new Map<string, { x: number; y: number }>();

    const startKey = `${bestStart.x},${bestStart.y}`;
    const hStart = Math.hypot(bestStart.x - bestEnd.x, bestStart.y - bestEnd.y);
    gScores.set(startKey, 0);
    pushHeap({ x: bestStart.x, y: bestStart.y, g: 0, f: hStart, key: startKey });

    let iterations = 0;
    const MAX_ITERATIONS = 4000;

    while (heap.length > 0 && iterations < MAX_ITERATIONS) {
      iterations++;

      const current = popHeap();
      if (!current) break;

      if (current.x === bestEnd.x && current.y === bestEnd.y) {
        // Reconstruir camino
        const path: { x: number; y: number }[] = [];
        let currKey: string | undefined = current.key;

        while (currKey) {
          const [cx, cy] = currKey.split(',').map(Number);
          path.push({ x: cx, y: cy });
          const prev = cameFrom.get(currKey);
          currKey = prev ? `${prev.x},${prev.y}` : undefined;
        }

        path.reverse();

        if (!this.isWaterTile(startX, startY)) {
          path.unshift({ x: startX, y: startY });
        }
        if (!this.isWaterTile(endX, endY)) {
          path.push({ x: endX, y: endY });
        }

        return path;
      }

      if (closedSet.has(current.key)) continue;
      closedSet.add(current.key);

      // Explorar 8 direcciones de agua
      const dirs = [
        [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
        [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]
      ];

      for (const [dx, dy, cost] of dirs) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        if (!this.isWaterTile(nx, ny)) continue;

        if (dx !== 0 && dy !== 0) {
          const side1 = this.isWaterTile(current.x + dx, current.y);
          const side2 = this.isWaterTile(current.x, current.y + dy);
          if (!side1 && !side2) continue;
        }

        const neighborKey = `${nx},${ny}`;
        if (closedSet.has(neighborKey)) continue;

        const tentativeG = current.g + cost;
        const existingG = gScores.get(neighborKey);

        if (existingG === undefined || tentativeG < existingG) {
          gScores.set(neighborKey, tentativeG);
          cameFrom.set(neighborKey, { x: current.x, y: current.y });
          const h = Math.hypot(nx - bestEnd.x, ny - bestEnd.y);
          pushHeap({
            x: nx,
            y: ny,
            g: tentativeG,
            f: tentativeG + h,
            key: neighborKey
          });
        }
      }
    }

    // Si excede iteraciones en aguas abiertas o mares complejos, devolver aproximación marítima suave
    const directDist = Math.hypot(startX - endX, startY - endY);
    if (directDist > 0) {
      const steps = Math.max(4, Math.floor(directDist / 3));
      const fallbackPath: { x: number; y: number }[] = [];
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        fallbackPath.push({
          x: Math.round(startX + (endX - startX) * u),
          y: Math.round(startY + (endY - startY) * u)
        });
      }
      return fallbackPath;
    }

    return null;
  }

  public getAdjacentLandTiles(tileId: string): GridTile[] {
    const tile = this.tilesMap.get(tileId);
    if (!tile) return [];

    const neighbors: GridTile[] = [];
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ];

    for (let d = 0; d < dirs.length; d++) {
      const nx = tile.x + dirs[d][0];
      const ny = tile.y + dirs[d][1];
      const nTile = this.getTileByXY(nx, ny);
      if (nTile) neighbors.push(nTile);
    }

    return neighbors;
  }
}

export const geoGridService = new GeoGridService();
