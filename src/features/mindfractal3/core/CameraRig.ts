// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Camera Rig - Deep zoom with progressive target follow and dynamic near plane
 */
export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  private tunnelDepth: number;
  private targetZ = 0;

  constructor(
    canvas: HTMLCanvasElement,
    aspect: number,
    tunnelDepth: number
  ) {
    this.tunnelDepth = tunnelDepth;

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.01, 1000);
    this.camera.position.set(0, 0, 8);

    // Orbit controls with pan enabled
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enablePan = true;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 0.5; // Allow deep zoom
    this.controls.maxDistance = 50;
    this.controls.target.set(0, 0, 0);
  }

  update(): void {
    // Progressive target-follow toward -0.95*depth when dollying
    const distance = this.camera.position.distanceTo(this.controls.target);
    
    if (distance < 10) {
      // User is zooming in, follow toward tunnel depth
      const targetZGoal = -this.tunnelDepth * 0.95;
      this.targetZ += (targetZGoal - this.targetZ) * 0.02;
      
      // Clamp target Z to prevent going through tunnel end
      this.targetZ = Math.max(targetZGoal, -this.tunnelDepth + 0.05);
      
      this.controls.target.z = this.targetZ;
    } else {
      // Far away, reset to center
      this.targetZ += (0 - this.targetZ) * 0.05;
      this.controls.target.z = this.targetZ;
    }

    // Dynamic near plane based on distance to target
    const distToTarget = this.camera.position.distanceTo(this.controls.target);
    this.camera.near = Math.max(0.01, distToTarget * 0.01);
    this.camera.updateProjectionMatrix();

    this.controls.update();
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.controls.dispose();
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
