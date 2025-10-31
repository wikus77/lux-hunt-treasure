// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';
import { samplePoints } from '../geometry/sampling';

export type NodeState = 'LOCKED' | 'DISCOVERED' | 'LINKED';

const NODE_COLORS: Record<NodeState, number> = {
  LOCKED: 0x666666,
  DISCOVERED: 0x35E9FF, // Cyan
  LINKED: 0xA64DFF     // Violet
};

const THEMES = ['Vision', 'Intuition', 'Courage', 'Justice', 'Risk'];
const NAMES = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
  'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi'
];

interface Node {
  id: number;
  position: THREE.Vector3;
  state: NodeState;
  theme: string;
  name: string;
  pulse: number;
}

/**
 * Node Layer - instanced rendering of neural nodes with states
 */
export class NodeLayer {
  root: THREE.Group;
  private instancedMesh: THREE.InstancedMesh | null = null;
  private nodes: Node[] = [];
  private geometry: THREE.BufferGeometry;
  private seed: number;
  private hoveredNode: number | null = null;

  constructor(tunnelGeometry: THREE.BufferGeometry, nodeCount: number, seed: number) {
    this.root = new THREE.Group();
    this.geometry = tunnelGeometry;
    this.seed = seed;
    this.initialize(nodeCount, seed);
  }

  private initialize(nodeCount: number, seed: number): void {
    // Sample positions
    const positions = samplePoints(this.geometry, nodeCount, seed);

    // Assign themes/names
    let s = seed;
    const seededRandom = () => {
      const x = Math.sin(s++) * 43758.5453123;
      return x - Math.floor(x);
    };

    this.nodes = positions.map((pos, i) => ({
      id: i,
      position: pos,
      state: 'LOCKED' as NodeState,
      theme: THEMES[Math.floor(seededRandom() * THEMES.length)],
      name: NAMES[i % NAMES.length],
      pulse: 0
    }));

    // Instanced mesh
    const sphereGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true
    });

    this.instancedMesh = new THREE.InstancedMesh(sphereGeo, material, nodeCount);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Initialize transforms and colors
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color(NODE_COLORS.LOCKED);

    for (let i = 0; i < nodeCount; i++) {
      matrix.setPosition(this.nodes[i].position);
      this.instancedMesh.setMatrixAt(i, matrix);
      this.instancedMesh.setColorAt(i, color);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.root.add(this.instancedMesh);
  }

  regenerate(tunnelGeometry: THREE.BufferGeometry, nodeCount: number, seed: number): void {
    // Dispose old mesh
    if (this.instancedMesh) {
      this.root.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
    }

    this.geometry = tunnelGeometry;
    this.seed = seed;
    this.initialize(nodeCount, seed);

    // Signal mesh reference changed
    window.dispatchEvent(new CustomEvent('mindfractal:nodes-regenerated'));
  }

  discover(id: number): void {
    const node = this.nodes[id];
    if (!node || node.state !== 'LOCKED') return;
    this.setNodeState(id, 'DISCOVERED');
  }

  link(id: number): void {
    const node = this.nodes[id];
    if (!node) return;
    this.setNodeState(id, 'LINKED');
  }

  setNodeState(id: number, state: NodeState): void {
    const node = this.nodes[id];
    if (!node || !this.instancedMesh) return;

    node.state = state;
    node.pulse = 1.0; // Trigger immediate pulse

    const color = new THREE.Color(NODE_COLORS[state]);
    this.instancedMesh.setColorAt(id, color);
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    // Immediate burst animation (150%)
    const matrix = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1.5, 1.5, 1.5);
    matrix.compose(node.position, q, s);
    this.instancedMesh.setMatrixAt(id, matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  raycast(raycaster: THREE.Raycaster): number | null {
    if (!this.instancedMesh) return null;

    const intersects = raycaster.intersectObject(this.instancedMesh);
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      return intersects[0].instanceId;
    }

    return null;
  }

  getNode(id: number): Node | null {
    return this.nodes[id] || null;
  }

  get mesh(): THREE.InstancedMesh | null {
    return this.instancedMesh;
  }

  setHover(id: number | null): void {
    if (id === this.hoveredNode) return;
    
    // Reset previous hover
    if (this.hoveredNode !== null && this.instancedMesh) {
      const prevNode = this.nodes[this.hoveredNode];
      if (prevNode && prevNode.pulse === 0) {
        const matrix = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const s = new THREE.Vector3(1, 1, 1);
        matrix.compose(prevNode.position, q, s);
        this.instancedMesh.setMatrixAt(this.hoveredNode, matrix);
        this.instancedMesh.instanceMatrix.needsUpdate = true;
      }
    }

    this.hoveredNode = id;

    // Apply new hover
    if (id !== null && this.instancedMesh) {
      const node = this.nodes[id];
      if (node) {
        const matrix = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const s = new THREE.Vector3(1.15, 1.15, 1.15);
        matrix.compose(node.position, q, s);
        this.instancedMesh.setMatrixAt(id, matrix);
        this.instancedMesh.instanceMatrix.needsUpdate = true;
      }
    }
  }

  update(deltaTime: number, reduced: boolean): void {
    if (!this.instancedMesh) return;

    const matrix = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      // Decay pulse
      if (node.pulse > 0) {
        node.pulse = Math.max(0, node.pulse - deltaTime * 5);
        const s = 1.0 + node.pulse * 0.5;
        scale.set(s, s, s);
      } else {
        scale.set(1, 1, 1);
      }

      matrix.compose(node.position, q, scale);
      this.instancedMesh.setMatrixAt(i, matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    if (this.instancedMesh) {
      this.root.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
