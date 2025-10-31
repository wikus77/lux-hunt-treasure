// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';
import type { NodeLayer, Node, NodeState } from '../nodes/NodeLayer';

export interface LinkResult {
  from: number;
  to: number;
  length: number;
  ts: number;
}

/**
 * Link Engine - manages connection rules between nodes
 * - 500ms cooldown between links
 * - Max distance: 12% of tunnel length
 * - Theme compatibility check
 */
export class LinkEngine {
  private lastLinkTime = 0;
  private readonly COOLDOWN_MS = 500;
  private readonly MAX_DISTANCE_RATIO = 0.12;
  private readonly tunnelLength: number;
  public pendingNodeId: number | null = null;

  constructor(tunnelLength: number) {
    this.tunnelLength = tunnelLength;
  }

  /**
   * Add first node to pending state
   */
  addPendingNode(nodeId: number): void {
    this.pendingNodeId = nodeId;
  }

  /**
   * Get pending node
   */
  getPendingNode(): number | null {
    return this.pendingNodeId;
  }

  /**
   * Reset pending state
   */
  resetPending(): void {
    this.pendingNodeId = null;
  }

  /**
   * Check if two nodes can be linked
   */
  canLink(nodeA: Node, nodeB: Node): { valid: boolean; reason?: string } {
    // Cooldown check
    const now = performance.now();
    if (now - this.lastLinkTime < this.COOLDOWN_MS) {
      return { valid: false, reason: 'cooldown' };
    }

    // Distance check
    const distance = nodeA.position.distanceTo(nodeB.position);
    const maxDist = this.tunnelLength * this.MAX_DISTANCE_RATIO;
    
    if (distance > maxDist) {
      return { valid: false, reason: 'too_far' };
    }

    // Theme compatibility (for now, all themes can link)
    // In future: add specific compatibility rules
    
    return { valid: true };
  }

  /**
   * Create link between two nodes
   */
  createLink(nodeA: Node, nodeB: Node): LinkResult | null {
    const check = this.canLink(nodeA, nodeB);
    if (!check.valid) {
      console.info('[LinkEngine] Cannot link:', check.reason);
      return null;
    }

    this.lastLinkTime = performance.now();
    this.pendingNodeId = null; // Clear pending after successful link
    
    const result: LinkResult = {
      from: nodeA.id,
      to: nodeB.id,
      length: nodeA.position.distanceTo(nodeB.position),
      ts: Date.now()
    };

    // Emit event
    console.info('[MF3D] link-created:', { from: nodeA.id, to: nodeB.id, len: result.length.toFixed(2), theme: nodeA.theme });
    window.dispatchEvent(new CustomEvent('mindfractal:link-created', { 
      detail: result 
    }));

    return result;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
