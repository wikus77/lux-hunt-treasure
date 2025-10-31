// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import type { NodeLayer } from './NodeLayer';

interface PickNodeEvent {
  nodeId: number;
  theme: string;
  worldPos: THREE.Vector3;
}

/**
 * Hook for raycasting and picking nodes with throttling
 */
export function usePickNode(
  nodeLayer: NodeLayer | null,
  camera: THREE.Camera | null,
  canvas: HTMLCanvasElement | null
) {
  const raycaster = useRef(new THREE.Raycaster());
  const throttleRef = useRef<number>(0);

  const pickNode = useCallback((event: MouseEvent): number | null => {
    if (!nodeLayer || !camera || !canvas) return null;

    // Throttle to prevent excessive raycasting
    const now = performance.now();
    if (now - throttleRef.current < 50) return null;
    throttleRef.current = now;

    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.current.setFromCamera(mouse, camera);
    const nodeId = nodeLayer.raycast(raycaster.current);

    if (nodeId !== null) {
      const node = nodeLayer.getNode(nodeId);
      if (node) {
        // Emit custom event with node data
        const pickEvent: PickNodeEvent = {
          nodeId,
          theme: node.theme,
          worldPos: node.position.clone()
        };
        
        window.dispatchEvent(new CustomEvent('mindfractal:node-selected', { 
          detail: pickEvent 
        }));
      }
    }

    return nodeId;
  }, [nodeLayer, camera, canvas]);

  return { pickNode };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
