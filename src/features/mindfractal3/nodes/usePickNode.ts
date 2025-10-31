// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { NodeLayer } from './NodeLayer';

const DRAG_THRESHOLD = 6; // pixels
const RAYCAST_THROTTLE = 33; // ~30Hz

interface PickState {
  mouseDown: THREE.Vector2 | null;
  lastRaycast: number;
  isDragging: boolean;
}

/**
 * Throttled raycasting hook with drag-vs-click detection
 */
export function usePickNode(
  camera: THREE.Camera,
  nodeLayer: NodeLayer | null,
  onNodeClick: (nodeId: number) => void
) {
  const stateRef = useRef<PickState>({
    mouseDown: null,
    lastRaycast: 0,
    isDragging: false
  });

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const handlePointerDown = useCallback((e: PointerEvent) => {
    stateRef.current.mouseDown = new THREE.Vector2(e.clientX, e.clientY);
    stateRef.current.isDragging = false;
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!stateRef.current.mouseDown) return;

    // Check drag threshold
    const dx = e.clientX - stateRef.current.mouseDown.x;
    const dy = e.clientY - stateRef.current.mouseDown.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > DRAG_THRESHOLD) {
      stateRef.current.isDragging = true;
    }

    // Throttled raycast for hover
    const now = performance.now();
    if (now - stateRef.current.lastRaycast < RAYCAST_THROTTLE) return;
    stateRef.current.lastRaycast = now;

    if (!nodeLayer) return;

    // Raycast
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(nodeLayer.mesh, true);

    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId;
      if (instanceId !== undefined) {
        nodeLayer.setHover(instanceId);
      }
    } else {
      nodeLayer.setHover(null);
    }
  }, [camera, nodeLayer]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!stateRef.current.mouseDown || !nodeLayer) {
      stateRef.current.mouseDown = null;
      return;
    }

    // Only trigger click if not dragging
    if (!stateRef.current.isDragging) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObject(nodeLayer.mesh, true);

      if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId;
        if (instanceId !== undefined) {
          onNodeClick(instanceId);
        }
      }
    }

    stateRef.current.mouseDown = null;
    stateRef.current.isDragging = false;
  }, [camera, nodeLayer, onNodeClick]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
