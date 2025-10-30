// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

export enum NodeState {
  LOCKED = 0,
  DISCOVERED = 1,
  LINKED = 2
}

interface Node {
  id: number;
  position: THREE.Vector3;
  state: NodeState;
}

const NODE_COLORS = {
  [NodeState.LOCKED]: 0x3b3b45,
  [NodeState.DISCOVERED]: 0x33ccff,
  [NodeState.LINKED]: 0xaa66ff
};

/**
 * System to manage clickable nodes along the tunnel
 */
export class NodeSystem {
  private scene: THREE.Scene;
  private nodes: Node[] = [];
  private instancedMesh: THREE.InstancedMesh | null = null;
  private geometry: THREE.BufferGeometry;

  constructor(scene: THREE.Scene, tunnelGeometry: THREE.BufferGeometry) {
    this.scene = scene;
    this.geometry = tunnelGeometry;
  }

  /**
   * Initialize nodes at equidistant points along tunnel
   */
  initialize(nodeCount: number): void {
    const positions = this.geometry.attributes.position;
    const totalVertices = positions.count;
    const step = Math.floor(totalVertices / nodeCount);

    this.nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * step;
      if (idx >= totalVertices) break;

      const position = new THREE.Vector3(
        positions.getX(idx),
        positions.getY(idx),
        positions.getZ(idx)
      );

      this.nodes.push({
        id: i,
        position,
        state: NodeState.LOCKED
      });
    }

    this.createInstancedMesh();
  }

  /**
   * Create instanced mesh for all nodes
   */
  private createInstancedMesh(): void {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
    }

    const sphereGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const material = new THREE.MeshBasicMaterial();

    this.instancedMesh = new THREE.InstancedMesh(
      sphereGeometry,
      material,
      this.nodes.length
    );

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      matrix.setPosition(node.position);
      this.instancedMesh.setMatrixAt(i, matrix);
      
      color.setHex(NODE_COLORS[node.state]);
      this.instancedMesh.setColorAt(i, color);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.scene.add(this.instancedMesh);
  }

  /**
   * Raycast to find clicked node
   */
  raycast(raycaster: THREE.Raycaster): number | null {
    if (!this.instancedMesh) return null;

    const intersects = raycaster.intersectObject(this.instancedMesh);
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      return intersects[0].instanceId;
    }

    return null;
  }

  /**
   * Get node state
   */
  getNodeState(nodeId: number): NodeState | null {
    const node = this.nodes.find(n => n.id === nodeId);
    return node ? node.state : null;
  }

  /**
   * Set node state and update color
   */
  setNodeState(nodeId: number, state: NodeState): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node || !this.instancedMesh) return;

    node.state = state;

    const color = new THREE.Color(NODE_COLORS[state]);
    this.instancedMesh.setColorAt(nodeId, color);
    
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Get node position
   */
  getNodePosition(nodeId: number): THREE.Vector3 | null {
    const node = this.nodes.find(n => n.id === nodeId);
    return node ? node.position.clone() : null;
  }

  /**
   * Get statistics
   */
  getStats(): { discovered: number; linked: number } {
    const discovered = this.nodes.filter(n => n.state === NodeState.DISCOVERED || n.state === NodeState.LINKED).length;
    const linked = this.nodes.filter(n => n.state === NodeState.LINKED).length;
    return { discovered, linked };
  }

  /**
   * Update node visuals (pulse effect)
   */
  update(elapsedTime: number): void {
    if (!this.instancedMesh) return;

    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3();

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      
      // Pulse discovered and linked nodes
      let pulseScale = 1.0;
      if (node.state === NodeState.DISCOVERED) {
        pulseScale = 1.0 + Math.sin(elapsedTime * 3 + i * 0.5) * 0.15;
      } else if (node.state === NodeState.LINKED) {
        pulseScale = 1.0 + Math.sin(elapsedTime * 2 + i * 0.3) * 0.1;
      }

      scale.set(pulseScale, pulseScale, pulseScale);
      matrix.compose(node.position, new THREE.Quaternion(), scale);
      this.instancedMesh.setMatrixAt(i, matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Regenerate nodes (for quality changes)
   */
  regenerate(tunnelGeometry: THREE.BufferGeometry, nodeCount: number): void {
    this.geometry = tunnelGeometry;
    this.initialize(nodeCount);
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
