import html2canvas from 'html2canvas';

export interface ExportImageOptions {
  fileName?: string;
  backgroundColor?: string;
  scale?: number;
}

/**
 * Convierte un elemento HTML en una imagen PNG y la descarga automáticamente
 */
export async function downloadElementAsImage(
  element: HTMLElement,
  fileName: string = 'geostrike-resultado.png',
  options: ExportImageOptions = {}
): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || '#0B0F19',
      scale: options.scale || 2, // Calidad HD 2x
      useCORS: true,
      allowTaint: true,
      logging: false
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Error generando imagen para descargar:', error);
    return false;
  }
}

/**
 * Convierte un elemento HTML en una imagen PNG y la copia directamente al portapapeles
 */
export async function copyElementImageToClipboard(
  element: HTMLElement,
  options: ExportImageOptions = {}
): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || '#0B0F19',
      scale: options.scale || 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        try {
          if (navigator.clipboard && typeof (window as any).ClipboardItem !== 'undefined') {
            const item = new (window as any).ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.writeText(''); // reset focus
            await (navigator.clipboard as any).write([item]);
            resolve(true);
            return;
          }
        } catch (e) {
          console.warn('Copia directa de imagen no soportada por el navegador:', e);
        }

        resolve(false);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error copiando imagen al portapapeles:', error);
    return false;
  }
}
