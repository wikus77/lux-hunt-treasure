// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';
import type { ElectricArcPool } from './ElectricArcPool';
import type { NodeLayer } from '../nodes/NodeLayer';

/**
 * Electric Scheduler - Poisson process for random arcs
 * λ ≈ 1.2/s baseline, reduced to 0.6/s if FPS < 45 for 3s
 */
export class ElectricScheduler {
  private arcPool: ElectricArcPool;
  private nodeLayer: NodeLayer | null = null;
  private lastSpawn = 0;
  private baseRate = 1.2; // arcs per second
  private currentRate = 1.2;
  private lowFpsStart = 0;
  private tunnelGeometry: THREE.BufferGeometry | null = null;

  constructor(arcPool: ElectricArcPool) {
    this.arcPool = arcPool;
  }

  setNodeLayer(nodeLayer: NodeLayer): void {
    this.nodeLayer = nodeLayer;
  }

  setTunnelGeometry(geometry: THREE.BufferGeometry): void {
    this.tunnelGeometry = geometry;
  }

  /**
   * Adjust spawn rate based on FPS
   */
  adjustForFPS(avgFPS: number, deltaTime: number): void {
    const now = performance.now();
    
    if (avgFPS < 45) {
      if (this.lowFpsStart === 0) {
        this.lowFpsStart = now;
      } else if (now - this.lowFpsStart > 3000) {
        // Low FPS for 3s, reduce rate
        this.currentRate = this.baseRate * 0.5;
      }
    } else {
      this.lowFpsStart = 0;
      this.currentRate = this.baseRate;
    }
  }

  /**
   * Increase spawn rate after milestone (max +40%)
   */
  increaseFrequency(boost: number): void {
    this.baseRate = Math.min(1.2 * 1.4, this.baseRate * (1 + boost));
    this.currentRate = this.baseRate;
  }

  /**
   * Spawn random idle arcs using Poisson distribution
   */
  update(deltaTime: number, reduced: boolean): void {
    if (reduced || !this.tunnelGeometry) return;

    const now = performance.now();
    const expectedInterval = 1000 / this.currentRate;

    // Poisson: random interval around expected
    const shouldSpawn = (now - this.lastSpawn) > expectedInterval * (0.8 + Math.random() * 0.4);

    if (shouldSpawn) {
      this.spawnRandomArc();
      this.lastSpawn = now;
    }
  }

  /**
   * Spawn arc between random points on tunnel
   */
  private spawnRandomArc(): void {
    if (!this.tunnelGeometry) return;

    const positions = this.tunnelGeometry.attributes.position;
    const count = positions.count;

    const idx1 = Math.floor(Math.random() * count);
    const idx2 = Math.floor(Math.random() * count);

    const start = new THREE.Vector3(
      positions.getX(idx1),
      positions.getY(idx1),
      positions.getZ(idx1)
    );

    const end = new THREE.Vector3(
      positions.getX(idx2),
      positions.getY(idx2),
      positions.getZ(idx2)
    );

    this.arcPool.createArc(start, end);
  }

  /**
   * Spawn white spike arc on user link
   */
  spawnLinkArc(start: THREE.Vector3, end: THREE.Vector3): void {
    this.arcPool.createArc(start, end);
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
