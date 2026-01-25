/**
 * Utilidades para manejo de imágenes
 * Funciones para validar, convertir y procesar imágenes antes de enviarlas a Meshy
 */

const MAX_IMAGE_SIZE_MB = 10;
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'] as const;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida que un archivo sea una imagen válida
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Validar tipo de archivo
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type as any)) {
    return {
      valid: false,
      error: `Formato no soportado. Formatos permitidos: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`,
    };
  }

  // Validar tamaño
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_IMAGE_SIZE_MB) {
    return {
      valid: false,
      error: `La imagen es demasiado grande. Tamaño máximo: ${MAX_IMAGE_SIZE_MB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Convierte un archivo a base64 (data URI)
 */
export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Obtiene las dimensiones de una imagen
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al cargar la imagen'));
    };
    
    img.src = url;
  });
}

/**
 * Comprime una imagen si es necesario
 * @param file Archivo de imagen
 * @param maxSizeMB Tamaño máximo en MB
 * @param quality Calidad de compresión (0-1)
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = MAX_IMAGE_SIZE_MB,
  quality: number = 0.8
): Promise<File> {
  const sizeMB = file.size / (1024 * 1024);
  
  // Si ya es menor al tamaño máximo, retornar sin comprimir
  if (sizeMB <= maxSizeMB) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }

        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 2048; // Máximo de píxeles
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen para comprimir'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Crea una URL de preview para una imagen
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Limpia una URL de preview creada con createImagePreview
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
