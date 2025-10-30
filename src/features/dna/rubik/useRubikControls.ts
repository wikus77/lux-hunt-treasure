/**
 * Rubik's Cube gesture controls
 * Handles drag rotation, tap, and pinch zoom
 */

import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import type { Face } from './types';

interface UseRubikControlsProps {
  onRotate: (face: Face, sliceIndex: number, clockwise: boolean) => void;
  onReset: () => void;
  enabled: boolean;
}

export function useRubikControls({
  onRotate,
  onReset,
  enabled
}: UseRubikControlsProps) {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle pointer down
   */
  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!enabled) return;
    
    isDragging.current = true;
    startPos.current = { x: event.clientX, y: event.clientY };
    tapCount.current++;

    // Double tap detection
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    if (tapCount.current === 2) {
      onReset();
      tapCount.current = 0;
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 300);
    }
  }, [enabled, onReset]);

  /**
   * Handle pointer move (drag)
   */
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!enabled || !isDragging.current) return;

    const dx = event.clientX - startPos.current.x;
    const dy = event.clientY - startPos.current.y;

    // Simple orbit control (no face rotation for now)
    // In full implementation, would raycast to detect face/slice
  }, [enabled]);

  /**
   * Handle pointer up
   */
  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  /**
   * Handle wheel (zoom)
   */
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!enabled) return;
    
    event.preventDefault();
    const delta = event.deltaY * 0.01;
    camera.position.z = Math.max(3, Math.min(14, camera.position.z + delta));
  }, [enabled, camera]);

  /**
   * Attach/detach listeners
   */
  const attach = useCallback(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [gl, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel]);

  return {
    attach
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
