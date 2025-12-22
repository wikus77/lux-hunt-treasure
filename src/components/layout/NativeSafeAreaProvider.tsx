// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Native Safe Area Provider - Injects CSS variables for safe area insets
// Enables native-like layout adaptation across all devices
// + Viewport Scaling for identical layout across all devices

import React, { useEffect, useState, useCallback } from 'react';
import { useNativeSafeArea } from '@/hooks/useNativeSafeArea';

// 🎯 DESIGN BASE: iPhone 16 Plus width (430px)
// All other devices will be scaled to match this layout
const DESIGN_BASE_WIDTH = 430;

// 🔧 FEATURE FLAG: Enable/disable viewport scaling
// Set to false for instant rollback
const ENABLE_VIEWPORT_SCALING = true;

interface NativeSafeAreaProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

/**
 * Provider component that injects CSS variables for safe area insets
 * These variables can be used anywhere in CSS with:
 * 
 * --native-safe-top: Top safe area inset (e.g., Dynamic Island)
 * --native-safe-bottom: Bottom safe area inset (e.g., Home Indicator)
 * --native-safe-left: Left safe area inset
 * --native-safe-right: Right safe area inset
 * --native-header-offset: Safe area + header height (72px)
 * --native-content-offset: Header offset + spacing (16px)
 * --native-bottom-nav-offset: Safe area + bottom nav height (64px)
 * 
 * Usage in Tailwind:
 * style={{ top: 'var(--native-header-offset, 131px)' }}
 * 
 * Or in CSS:
 * top: calc(var(--native-header-offset) + 16px);
 */
export const NativeSafeAreaProvider: React.FC<NativeSafeAreaProviderProps> = ({ 
  children, 
  debug = false 
}) => {
  const { insets, source, isReady, headerOffset, contentOffset, bottomNavOffset } = useNativeSafeArea();
  const [viewportScale, setViewportScale] = useState(1);

  // 📐 Calculate viewport scale based on screen width vs design base
  const calculateScale = useCallback(() => {
    if (!ENABLE_VIEWPORT_SCALING) return 1;
    
    const screenWidth = window.innerWidth;
    // Scale down for smaller screens, but never scale up beyond 1
    const scale = Math.min(screenWidth / DESIGN_BASE_WIDTH, 1);
    return scale;
  }, []);

  // 📱 Apply viewport scaling
  useEffect(() => {
    if (!ENABLE_VIEWPORT_SCALING) return;

    const updateScale = () => {
      const newScale = calculateScale();
      setViewportScale(newScale);
      
      // Apply scale to CSS variable for potential CSS usage
      document.documentElement.style.setProperty('--viewport-scale', String(newScale));
      
      if (debug || import.meta.env.DEV) {
        console.log('[NativeSafeAreaProvider] 📐 Viewport scale:', {
          screenWidth: window.innerWidth,
          designBase: DESIGN_BASE_WIDTH,
          scale: newScale,
          percentage: `${(newScale * 100).toFixed(1)}%`
        });
      }
    };

    updateScale();

    // Update on resize/orientation change
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', () => setTimeout(updateScale, 100));

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, [calculateScale, debug]);

  // Apply CSS variables to document root
  useEffect(() => {
    if (!isReady) return;

    const root = document.documentElement;

    // Core safe area values
    root.style.setProperty('--native-safe-top', `${insets.top}px`);
    root.style.setProperty('--native-safe-bottom', `${insets.bottom}px`);
    root.style.setProperty('--native-safe-left', `${insets.left}px`);
    root.style.setProperty('--native-safe-right', `${insets.right}px`);

    // Computed offsets for common use cases
    root.style.setProperty('--native-header-offset', `${headerOffset}px`);
    root.style.setProperty('--native-content-offset', `${contentOffset}px`);
    root.style.setProperty('--native-bottom-nav-offset', `${bottomNavOffset}px`);

    // Also set as CSS classes for Tailwind-like usage
    root.style.setProperty('--m1-safe-top', `${insets.top}px`);
    root.style.setProperty('--m1-header-top', `${headerOffset}px`);

    if (debug || import.meta.env.DEV) {
      console.log('[NativeSafeAreaProvider] 🎯 CSS Variables applied:', {
        source,
        insets,
        headerOffset,
        contentOffset,
        bottomNavOffset
      });
    }

    // Cleanup function
    return () => {
      // Keep variables on unmount for smooth transitions
    };
  }, [insets, source, isReady, headerOffset, contentOffset, bottomNavOffset, debug]);

  // 🎨 Calculate wrapper styles for viewport scaling
  const getScaleWrapperStyle = (): React.CSSProperties => {
    if (!ENABLE_VIEWPORT_SCALING || viewportScale >= 1) {
      return {}; // No scaling needed
    }

    return {
      transform: `scale(${viewportScale})`,
      transformOrigin: 'top center',
      width: `${100 / viewportScale}%`,
      minHeight: `${100 / viewportScale}vh`,
    };
  };

  // 🔧 Render with or without scaling wrapper
  const renderContent = () => {
    // If scaling is disabled or scale is 1, render children directly
    if (!ENABLE_VIEWPORT_SCALING || viewportScale >= 0.99) {
      return <>{children}</>;
    }

    // Apply scaling wrapper
    return (
      <div 
        className="viewport-scale-wrapper"
        style={getScaleWrapperStyle()}
      >
        {children}
      </div>
    );
  };

  // Debug overlay in development
  if (debug && import.meta.env.DEV) {
    return (
      <>
        {renderContent()}
        <div 
          className="fixed bottom-20 left-2 z-[99999] bg-black/80 text-white text-xs p-2 rounded font-mono"
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-cyan-400 font-bold mb-1">Safe Area ({source})</div>
          <div>top: {insets.top}px</div>
          <div>bottom: {insets.bottom}px</div>
          <div>header: {headerOffset}px</div>
          {ENABLE_VIEWPORT_SCALING && viewportScale < 1 && (
            <div className="text-yellow-400 mt-1">scale: {(viewportScale * 100).toFixed(1)}%</div>
          )}
        </div>
      </>
    );
  }

  return renderContent();
};

export default NativeSafeAreaProvider;

