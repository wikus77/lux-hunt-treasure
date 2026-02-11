// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * SafeImage - Image component with graceful fallback
 * 
 * Features:
 * - onError fallback to placeholder
 * - Optional loading state
 * - Platform-aware (can resolve to CDN on Android)
 */

import React, { useState, useCallback, ImgHTMLAttributes } from 'react';

// Default fallback placeholder (transparent 1x1 pixel or custom)
const DEFAULT_FALLBACK = '/assets/placeholder-prize.png';
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  /** Primary image source */
  src: string;
  /** Fallback image if src fails to load */
  fallbackSrc?: string;
  /** Show transparent pixel instead of fallback on error */
  hideOnError?: boolean;
  /** Callback when error occurs */
  onLoadError?: (src: string) => void;
  /** Additional className for error state */
  errorClassName?: string;
}

export function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  hideOnError = false,
  onLoadError,
  errorClassName,
  className,
  alt,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when src prop changes
  React.useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = useCallback(() => {
    if (!hasError) {
      console.warn(`[SafeImage] Failed to load: ${src}`);
      setHasError(true);
      
      if (hideOnError) {
        setCurrentSrc(TRANSPARENT_PIXEL);
      } else {
        setCurrentSrc(fallbackSrc);
      }
      
      if (onLoadError) {
        onLoadError(src);
      }
    }
  }, [src, fallbackSrc, hasError, hideOnError, onLoadError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt || 'Image'}
      className={`${className || ''} ${hasError ? errorClassName || '' : ''}`}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}

export default SafeImage;
