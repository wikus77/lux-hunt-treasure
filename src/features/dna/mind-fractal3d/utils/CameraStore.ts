// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  zoom: number;
}

/**
 * Persist camera state to localStorage
 */
export class CameraStore {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  save(state: CameraState): void {
    try {
      const data = {
        position: { x: state.position.x, y: state.position.y, z: state.position.z },
        target: { x: state.target.x, y: state.target.y, z: state.target.z },
        zoom: state.zoom
      };
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
      console.warn('[CameraStore] Failed to save:', e);
    }
  }

  load(): CameraState | null {
    try {
      const json = localStorage.getItem(this.key);
      if (!json) return null;

      const data = JSON.parse(json);
      return {
        position: new THREE.Vector3(data.position.x, data.position.y, data.position.z),
        target: new THREE.Vector3(data.target.x, data.target.y, data.target.z),
        zoom: data.zoom
      };
    } catch (e) {
      console.warn('[CameraStore] Failed to load:', e);
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (e) {
      console.warn('[CameraStore] Failed to clear:', e);
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
