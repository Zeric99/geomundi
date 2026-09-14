/**
 * Servicio de Pre-carga y Caché de Mapas (GeoJSON / TopoJSON)
 * Acelera la carga de mapas a 0ms reduciendo los tiempos de cambio de pestaña
 * y almacenando en memoria y CacheStorage del navegador.
 */

class MapPreloadService {
  private inMemoryCache: any = null;
  private isPreloading: boolean = false;
  private preloadPromise: Promise<any> | null = null;
  private readonly CACHE_NAME = 'geomundi-maps-v1';
  private readonly MAP_URL = `${import.meta.env.BASE_URL}data/world-50m.json`;

  /**
   * Inicia la pre-carga en segundo plano
   */
  startPreload(): void {
    if (this.inMemoryCache || this.isPreloading) return;
    this.preloadPromise = this.fetchMapData();
  }

  /**
   * Obtiene los datos del mapa con estrategia Cache-First
   */
  async getMapData(): Promise<any> {
    if (this.inMemoryCache) {
      return this.inMemoryCache;
    }
    if (this.preloadPromise) {
      return this.preloadPromise;
    }
    this.preloadPromise = this.fetchMapData();
    return this.preloadPromise;
  }

  private async fetchMapData(): Promise<any> {
    this.isPreloading = true;

    // 1. Intentar recuperar de CacheStorage
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        const cachedResponse = await cache.match(this.MAP_URL);
        if (cachedResponse) {
          const json = await cachedResponse.json();
          this.inMemoryCache = json;
          this.isPreloading = false;
          return json;
        }
      } catch (e) {
        // Ignorar fallos de CacheStorage
      }
    }

    // 2. Fetch de red
    try {
      const response = await fetch(this.MAP_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Guardar clon en CacheStorage en segundo plano
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open(this.CACHE_NAME);
          cache.put(this.MAP_URL, response.clone());
        } catch (e) {}
      }

      const json = await response.json();
      this.inMemoryCache = json;
      this.isPreloading = false;
      return json;
    } catch (err) {
      this.isPreloading = false;
      console.warn('No se pudo precargar el mapa localmente:', err);
      return null;
    }
  }

  /**
   * Devuelve los datos en memoria sincrónicamente si ya están listos
   */
  getImmediateData(): any | null {
    return this.inMemoryCache;
  }
}

export const mapPreloadService = new MapPreloadService();
