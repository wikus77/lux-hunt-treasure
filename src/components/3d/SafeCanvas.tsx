/**
 * M1SSION™ Safe Canvas - WebGL-aware Three.js Canvas
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Wrapper per Canvas di @react-three/fiber che:
 * - Verifica disponibilità WebGL context prima di renderizzare
 * - Mostra fallback se limite raggiunto
 * - Registra context con WebGLManager per tracking
 */

import React, { useState, useEffect, useCallback, ReactNode, useId } from 'react';
import { WebGLManager } from '@/lib/webgl/WebGLManager';
import { SectionErrorBoundary } from '@/components/error/SectionErrorBoundary';

interface SafeCanvasProps {
  children: ReactNode;
  /** Fallback UI quando WebGL non disponibile */
  fallback?: ReactNode;
  /** Altezza del canvas/fallback */
  height?: string | number;
  /** Classe CSS per container */
  className?: string;
  /** Nome sezione per error boundary */
  sectionName?: string;
  /** Callback quando WebGL non disponibile */
  onWebGLUnavailable?: () => void;
}

/**
 * SafeCanvas - Wrapper che verifica WebGL prima di montare Three.js Canvas
 */
const SafeCanvas: React.FC<SafeCanvasProps> = ({
  children,
  fallback,
  height = '100%',
  className = '',
  sectionName = '3D View',
  onWebGLUnavailable,
}) => {
  const [canRender, setCanRender] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const uniqueId = useId();

  useEffect(() => {
    // Check if we can create a WebGL context
    const canCreate = WebGLManager.canCreateContext();
    
    if (!canCreate) {
      console.warn(`[SafeCanvas:${sectionName}] WebGL context limit reached`);
      onWebGLUnavailable?.();
    }
    
    setCanRender(canCreate);
    setIsChecking(false);
    
    // Mark active when mounted
    return () => {
      WebGLManager.markInactive(`safe-canvas-${uniqueId}`);
    };
  }, [sectionName, onWebGLUnavailable, uniqueId]);

  // Loading state
  if (isChecking) {
    return (
      <div 
        className={className}
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
          Caricamento...
        </div>
      </div>
    );
  }

  // WebGL unavailable - show fallback
  if (!canRender) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div 
        className={className}
        style={{ 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(20,20,40,0.9), rgba(10,10,30,0.95))',
          borderRadius: '12px',
          border: '1px solid rgba(100,150,255,0.2)',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎮</div>
        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '14px',
          marginBottom: '8px' 
        }}>
          {sectionName} non disponibile
        </p>
        <p style={{ 
          color: 'rgba(255,255,255,0.4)', 
          fontSize: '11px' 
        }}>
          Risorse grafiche al limite. Chiudi altre visualizzazioni 3D.
        </p>
      </div>
    );
  }

  // WebGL available - render with error boundary
  return (
    <SectionErrorBoundary 
      section={sectionName} 
      fallbackHeight={typeof height === 'number' ? `${height}px` : height}
    >
      <div className={className} style={{ height, position: 'relative' }}>
        {children}
      </div>
    </SectionErrorBoundary>
  );
};

export default SafeCanvas;

