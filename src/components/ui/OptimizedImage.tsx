/**
 * Optimized Image Component with WebP/AVIF Support
 * M1SSION™ - Performance Enhancement
 */

import React, { useEffect, useRef, useState } from 'react';
import { generateImageSources, OptimizedImageProps, globalImageLoader } from '@/utils/imageOptimizer';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
  quality = 80,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const sources = generateImageSources(src, quality);
  const isLazy = loading === 'lazy' && !priority;

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !isLazy) return;

    // Use global lazy loader
    globalImageLoader.observe(img);

    return () => {
      // Cleanup is handled by the global loader
    };
  }, [isLazy]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Immagine non disponibile</span>
      </div>
    );
  }

  return (
    <picture className={className}>
      {sources.slice(0, -1).map((source, index) => (
        <source
          key={index}
          srcSet={isLazy ? undefined : source.src}
          data-srcset={isLazy ? source.src : undefined}
          type={source.type}
          sizes={sizes}
        />
      ))}
      <img
        ref={imgRef}
        src={isLazy ? undefined : src}
        data-src={isLazy ? src : undefined}
        alt={alt}
        loading={priority ? 'eager' : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${isLazy ? 'lazy-loading' : ''}
          ${className}
        `}
        {...props}
      />
    </picture>
  );
};