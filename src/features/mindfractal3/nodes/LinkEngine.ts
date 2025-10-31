// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { supabase } from '@/integrations/supabase/client';
import type { NodeLayer } from './NodeLayer';

/**
 * Link Engine - manages node selection and linking with backend sync
 */
export class LinkEngine {
  private nodeLayer: NodeLayer;
  private userId: string;
  private seed: number;
  private selectedNode: number | null = null;
  private lastLinkTime = 0;
  private readonly COOLDOWN_MS = 500;

  constructor(nodeLayer: NodeLayer, userId: string, seed: number) {
    this.nodeLayer = nodeLayer;
    this.userId = userId;
    this.seed = seed;
  }

  /**
   * Select a node or link if already selected
   */
  async selectOrLink(nodeId: number): Promise<void> {
    const node = this.nodeLayer.getNode(nodeId);
    if (!node) return;

    // If same node, deselect
    if (this.selectedNode === nodeId) {
      this.selectedNode = null;
      return;
    }

    // If no selection, select this one
    if (this.selectedNode === null) {
      this.selectedNode = nodeId;
      return;
    }

    // Attempt link
    await this.tryLink(this.selectedNode, nodeId);
    this.selectedNode = null;
  }

  private async tryLink(fromId: number, toId: number): Promise<void> {
    // Cooldown check
    const now = Date.now();
    if (now - this.lastLinkTime < this.COOLDOWN_MS) {
      console.warn('[MF3D] link cooldown active');
      return;
    }

    const nodeA = this.nodeLayer.getNode(fromId);
    const nodeB = this.nodeLayer.getNode(toId);
    if (!nodeA || !nodeB) return;

    // Distance check (12% of tunnel depth ≈ 4.8 units)
    const dist = nodeA.position.distanceTo(nodeB.position);
    if (dist > 4.8) {
      console.warn('[MF3D] link distance exceeded:', dist.toFixed(2));
      return;
    }

    // Theme matching check (bonus if same theme, but not required)
    const sameTheme = nodeA.theme === nodeB.theme;

    // Update states
    this.nodeLayer.link(fromId);
    this.nodeLayer.link(toId);

    this.lastLinkTime = now;

    // Emit link-created event
    window.dispatchEvent(new CustomEvent('mindfractal:link-created', {
      detail: {
        from: fromId,
        to: toId,
        theme: nodeA.theme,
        length: dist,
        ts: now
      }
    }));

    // Backend sync
    try {
      const { data, error } = await supabase.rpc('upsert_dna_mind_link', {
        p_user_id: this.userId,
        p_seed: this.seed,
        p_a: fromId,
        p_b: toId,
        p_theme: nodeA.theme,
        p_intensity: sameTheme ? 1.5 : 1.0
      });

      if (error) {
        console.error('[MF3D] backend sync error:', error);
        return;
      }

      console.info('[MF3D] backend sync:', data);

      // Check for milestone (type assertion for RPC response)
      const response = data as unknown as {
        total_links: number;
        theme_links: number;
        milestone_added: boolean;
        milestone_level: number;
      };

      if (response && response.milestone_added) {
        window.dispatchEvent(new CustomEvent('mindfractal:evolve', {
          detail: {
            theme: nodeA.theme,
            level: response.milestone_level,
            theme_links: response.theme_links
          }
        }));
      }
    } catch (err) {
      console.error('[MF3D] link sync exception:', err);
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
