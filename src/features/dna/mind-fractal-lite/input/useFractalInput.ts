// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

export interface FractalInputEvent {
  type: 'tap' | 'hold' | 'trace';
  position: { x: number; y: number };
  worldPosition?: THREE.Vector3;
  normalized: { x: number; y: number };
}

export interface FractalInputOptions {
  onTap?: (event: FractalInputEvent) => void;
  onHold?: (event: FractalInputEvent) => void;
  onTrace?: (event: FractalInputEvent) => void;
  holdThreshold?: number; // ms
}

/**
 * Input handling for Mind Fractal 3D
 * Detects tap, hold, and trace gestures
 * Converts screen coordinates to normalized coordinates
 */
export function useFractalInput(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  camera: THREE.Camera | null,
  options: FractalInputOptions
) {
  const {
    onTap,
    onHold,
    onTrace,
    holdThreshold = 500
  } = options;
  
  const holdTimer = useRef<number | null>(null);
  const isHolding = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  
  const clearHoldTimer = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);
  
  const getNormalizedCoords = useCallback((
    clientX: number,
    clientY: number
  ): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    return { x, y };
  }, [canvasRef]);
  
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (!canvasRef.current) return;
    
    const normalized = getNormalizedCoords(e.clientX, e.clientY);
    startPos.current = { x: e.clientX, y: e.clientY };
    isHolding.current = false;
    
    // Start hold timer
    holdTimer.current = window.setTimeout(() => {
      isHolding.current = true;
      
      if (onHold) {
        onHold({
          type: 'hold',
          position: { x: e.clientX, y: e.clientY },
          normalized
        });
      }
    }, holdThreshold);
    
  }, [canvasRef, getNormalizedCoords, onHold, holdThreshold]);
  
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!canvasRef.current || !startPos.current) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If moved significantly, it's a trace gesture
    if (distance > 10) {
      clearHoldTimer();
      
      if (onTrace && !isHolding.current) {
        const normalized = getNormalizedCoords(e.clientX, e.clientY);
        
        onTrace({
          type: 'trace',
          position: { x: e.clientX, y: e.clientY },
          normalized
        });
      }
    }
  }, [canvasRef, clearHoldTimer, getNormalizedCoords, onTrace]);
  
  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!canvasRef.current || !startPos.current) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    clearHoldTimer();
    
    // If didn't move much and wasn't holding, it's a tap
    if (distance < 10 && !isHolding.current && onTap) {
      const normalized = getNormalizedCoords(e.clientX, e.clientY);
      
      onTap({
        type: 'tap',
        position: { x: e.clientX, y: e.clientY },
        normalized
      });
    }
    
    startPos.current = null;
    isHolding.current = false;
  }, [canvasRef, clearHoldTimer, getNormalizedCoords, onTap]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      clearHoldTimer();
    };
  }, [canvasRef, handlePointerDown, handlePointerMove, handlePointerUp, clearHoldTimer]);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
