/**
 * Image Optimization Utilities
 * M1SSION™ - Performance Enhancement
 */

export interface ImageFormat {
  src: string;
  type: string;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

/**
 * Generate WebP and AVIF sources for an image
 */
export function generateImageSources(src: string, quality: number = 80): ImageFormat[] {
  const baseName = src.replace(/\.[^/.]+$/, '');
  
  return [
    { src: `${baseName}.avif`, type: 'image/avif' },
    { src: `${baseName}.webp`, type: 'image/webp' },
    { src, type: getImageMimeType(src) },
  ];
}

/**
 * Get MIME type from file extension
 */
function getImageMimeType(src: string): string {
  const extension = src.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
}

/**
 * Create responsive image sizes
 */
export function generateResponsiveSizes(breakpoints: { [key: string]: number }): string {
  return Object.entries(breakpoints)
    .map(([size, width]) => `(max-width: ${width}px) ${width}px`)
    .join(', ') + ', 100vw';
}

/**
 * Lazy loading intersection observer for images
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private imageQueue = new Set<HTMLImageElement>();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
        rootMargin: '50px 0px',
        threshold: 0.01,
        ...options,
      });
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.observer?.unobserve(img);
        this.imageQueue.delete(img);
      }
    });
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src) {
      img.src = src;
    }
    if (srcset) {
      img.srcset = srcset;
    }
    
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.imageQueue.add(img);
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.imageQueue.clear();
    }
  }
}

// Global lazy loader instance
export const globalImageLoader = new LazyImageLoader();