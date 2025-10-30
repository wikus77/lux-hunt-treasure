/**
 * Rubik's Cube Gesture Controls
 * Raycast-based face detection + drag → slice rotation
 */

import * as THREE from 'three';
import type { Face, Move } from '../types';

export interface GestureHandler {
  onMove: (move: Move) => void;
  onReset: () => void;
}

export class RubikGestureController {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragFace: Face | null = null;
  private dragSlice = 0;
  private lastTap = 0;
  private canvas: HTMLCanvasElement | null = null;
  private camera: THREE.Camera | null = null;
  private cubies: THREE.Object3D[] = [];
  private handler: GestureHandler;

  constructor(handler: GestureHandler) {
    this.handler = handler;
  }

  /**
   * Attach to canvas and register event listeners
   */
  attach(canvas: HTMLCanvasElement, camera: THREE.Camera, cubies: THREE.Object3D[]) {
    this.canvas = canvas;
    this.camera = camera;
    this.cubies = cubies;

    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointermove', this.handlePointerMove);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('pointercancel', this.handlePointerUp);
  }

  /**
   * Detach and cleanup
   */
  detach() {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
      this.canvas.removeEventListener('pointermove', this.handlePointerMove);
      this.canvas.removeEventListener('pointerup', this.handlePointerUp);
      this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    }
    this.canvas = null;
    this.camera = null;
    this.cubies = [];
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (!this.canvas || !this.camera) return;

    // Double-tap detection
    const now = Date.now();
    if (now - this.lastTap < 300) {
      this.handler.onReset();
      this.lastTap = 0;
      return;
    }
    this.lastTap = now;

    this.isDragging = true;
    this.dragStart = { x: e.clientX, y: e.clientY };

    // Raycast to detect clicked face
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cubies, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const normal = hit.face?.normal;
      if (normal) {
        // Transform normal to world space
        const worldNormal = normal.clone().transformDirection(hit.object.matrixWorld);
        this.dragFace = this.getFaceFromNormal(worldNormal);
      }
    }
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isDragging || !this.dragFace) return;

    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;
    const threshold = 20;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      // Determine slice and direction
      const horizontal = Math.abs(dx) > Math.abs(dy);
      const direction = horizontal ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');

      const move = this.computeMove(this.dragFace, direction, horizontal);
      if (move) {
        this.handler.onMove(move);
        this.isDragging = false; // Prevent multiple moves
      }
    }
  };

  private handlePointerUp = () => {
    this.isDragging = false;
    this.dragFace = null;
  };

  /**
   * Determine face from raycast normal
   */
  private getFaceFromNormal(normal: THREE.Vector3): Face | null {
    const abs = normal.clone().normalize();
    
    if (Math.abs(abs.x) > 0.9) return abs.x > 0 ? 'R' : 'L';
    if (Math.abs(abs.y) > 0.9) return abs.y > 0 ? 'U' : 'D';
    if (Math.abs(abs.z) > 0.9) return abs.z > 0 ? 'F' : 'B';
    
    return null;
  }

  /**
   * Compute move notation from face + drag direction
   */
  private computeMove(face: Face, direction: string, horizontal: boolean): Move | null {
    // Simplified: always rotate outermost layer
    // For full 4x4, would need to detect which row/column was clicked
    
    let move: Move = face;
    
    // Determine if clockwise or counter-clockwise based on face and direction
    const needsPrime = this.needsCounterClockwise(face, direction, horizontal);
    if (needsPrime) move += "'";
    
    return move;
  }

  /**
   * Determine if move should be counter-clockwise
   */
  private needsCounterClockwise(face: Face, direction: string, horizontal: boolean): boolean {
    switch (face) {
      case 'U':
      case 'D':
        return horizontal ? direction === 'left' : direction === 'down';
      case 'L':
      case 'R':
        return horizontal ? direction === 'right' : direction === 'down';
      case 'F':
      case 'B':
        return horizontal ? direction === 'left' : direction === 'up';
      default:
        return false;
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
