// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * SafeVideo - Video component with graceful fallback
 * 
 * Features:
 * - onError fallback to poster image or placeholder
 * - Silent failure without crashing
 * - Platform-aware (can resolve to CDN on Android)
 */

import React, { useState, useCallback, useRef, VideoHTMLAttributes, forwardRef } from 'react';

const DEFAULT_POSTER = '/assets/video-placeholder.png';

interface SafeVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'onError'> {
  /** Primary video source */
  src: string;
  /** Fallback poster to show if video fails */
  fallbackPoster?: string;
  /** Callback when video loaded successfully */
  onVideoReady?: () => void;
  /** Callback when video fails to load */
  onVideoError?: (src: string) => void;
  /** Callback when video ends */
  onVideoEnd?: () => void;
  /** Show fallback image instead of broken video */
  showFallbackOnError?: boolean;
  /** Additional className for fallback state */
  fallbackClassName?: string;
}

export const SafeVideo = forwardRef<HTMLVideoElement, SafeVideoProps>(({
  src,
  fallbackPoster = DEFAULT_POSTER,
  onVideoReady,
  onVideoError,
  onVideoEnd,
  showFallbackOnError = true,
  fallbackClassName,
  className,
  poster,
  ...props
}, externalRef) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const internalRef = useRef<HTMLVideoElement>(null);
  
  // Use external ref if provided, otherwise internal
  const videoRef = (externalRef as React.RefObject<HTMLVideoElement>) || internalRef;

  // Reset state when src changes
  React.useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = useCallback(() => {
    console.warn(`[SafeVideo] Failed to load: ${src}`);
    setHasError(true);
    setIsLoading(false);
    
    if (onVideoError) {
      onVideoError(src);
    }
  }, [src, onVideoError]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    if (onVideoReady) {
      onVideoReady();
    }
  }, [onVideoReady]);

  const handleEnded = useCallback(() => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  }, [onVideoEnd]);

  // If error and showFallbackOnError, render fallback image
  if (hasError && showFallbackOnError) {
    return (
      <div className={`${className || ''} ${fallbackClassName || ''}`}>
        <img
          src={fallbackPoster || poster}
          alt="Video fallback"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      {...props}
      src={src}
      poster={poster || fallbackPoster}
      className={className}
      onError={handleError}
      onCanPlay={handleCanPlay}
      onEnded={handleEnded}
    />
  );
});

SafeVideo.displayName = 'SafeVideo';

export default SafeVideo;
