// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

export enum NodeState {
  LOCKED = 0,
  DISCOVERED = 1,
  LINKED = 2
}

export type NodeTheme = 'Etica' | 'Strategia' | 'Adattività' | 'Visione';

export interface Node {
  id: number;
  position: THREE.Vector3;
  state: NodeState;
  theme: NodeTheme;
  name: string; // Symbolic name for tooltip
}

const NODE_COLORS = {
  [NodeState.LOCKED]: 0x8899AA,      // Subtle gray-blue for locked
  [NodeState.DISCOVERED]: 0x35E9FF,  // Cyan for discovered
  [NodeState.LINKED]: 0xA64DFF       // Violet for linked
};

const THEME_NAMES = {
  'Etica': ['Compasso', 'Bilancia', 'Scudo', 'Luce'],
  'Strategia': ['Torre', 'Sentinella', 'Occhio', 'Mappa'],
  'Adattività': ['Camaleonte', 'Riflesso', 'Onda', 'Foglia'],
  'Visione': ['Stella', 'Prisma', 'Faro', 'Oracolo']
};

/**
 * Node Layer - manages 48 nodes with themes, states, and symbolic names
 * Exposes public mesh getter for external access to instanced mesh
 */
export class NodeLayer {
  private scene: THREE.Scene;
  private nodes: Node[] = [];
  private instancedMesh: THREE.InstancedMesh | null = null;
  private geometry: THREE.BufferGeometry;

  constructor(scene: THREE.Scene, tunnelGeometry: THREE.BufferGeometry) {
    this.scene = scene;
    this.geometry = tunnelGeometry;
  }

  /**
   * Initialize 48 nodes with deterministic themes and symbolic names
   */
  initialize(nodeCount: number, seed: number = 42): void {
    const positions = this.geometry.attributes.position;
    const totalVertices = positions.count;
    const step = Math.floor(totalVertices / nodeCount);

    this.nodes = [];
    
    const themes: NodeTheme[] = ['Etica', 'Strategia', 'Adattività', 'Visione'];

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * step;
      if (idx >= totalVertices) break;

      const position = new THREE.Vector3(
        positions.getX(idx),
        positions.getY(idx),
        positions.getZ(idx)
      );
      
      const themeIndex = (seed + i * 7) % themes.length;
      const theme = themes[themeIndex];
      const nameIndex = Math.floor(i / themes.length) % THEME_NAMES[theme].length;
      const name = `${theme} • ${THEME_NAMES[theme][nameIndex]}`;

      this.nodes.push({
        id: i,
        position,
        state: NodeState.LOCKED,
        theme,
        name
      });
    }

    this.createInstancedMesh();
  }

  private createInstancedMesh(): void {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
    }

    const sphereGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true });

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
   * Public accessor for the instanced mesh
   */
  get mesh(): THREE.InstancedMesh {
    if (!this.instancedMesh) {
      throw new Error('[NodeLayer] mesh accessed before initialization');
    }
    return this.instancedMesh;
  }

  raycast(raycaster: THREE.Raycaster): number | null {
    if (!this.instancedMesh) return null;

    const intersects = raycaster.intersectObject(this.instancedMesh);
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      return intersects[0].instanceId;
    }

    return null;
  }

  getNode(nodeId: number): Node | null {
    return this.nodes.find(n => n.id === nodeId) || null;
  }

  getNodeState(nodeId: number): NodeState | null {
    const node = this.getNode(nodeId);
    return node ? node.state : null;
  }

  setNodeState(nodeId: number, state: NodeState): void {
    const node = this.getNode(nodeId);
    if (!node || !this.instancedMesh) return;

    node.state = state;

    const color = new THREE.Color(NODE_COLORS[state]);
    this.instancedMesh.setColorAt(nodeId, color);
    
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  getStats(): { discovered: number; linked: number } {
    const discovered = this.nodes.filter(n => n.state === NodeState.DISCOVERED || n.state === NodeState.LINKED).length;
    const linked = this.nodes.filter(n => n.state === NodeState.LINKED).length;
    return { discovered, linked };
  }

  /**
   * Update with hover highlight and pulse animations
   */
  update(elapsedTime: number, hoveredNodeId: number | null = null): void {
    if (!this.instancedMesh) return;

    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      
      let pulseScale = 1.0;
      if (node.state === NodeState.DISCOVERED) {
        pulseScale = 1.0 + Math.sin(elapsedTime * 3 + i * 0.5) * 0.15;
      } else if (node.state === NodeState.LINKED) {
        pulseScale = 1.0 + Math.sin(elapsedTime * 2 + i * 0.3) * 0.1;
      }
      
      // Hover highlight
      if (hoveredNodeId === node.id) {
        pulseScale *= 1.5;
        color.setHex(NODE_COLORS[node.state]).multiplyScalar(1.5);
        this.instancedMesh.setColorAt(i, color);
      } else {
        color.setHex(NODE_COLORS[node.state]);
        this.instancedMesh.setColorAt(i, color);
      }

      scale.set(pulseScale, pulseScale, pulseScale);
      matrix.compose(node.position, new THREE.Quaternion(), scale);
      this.instancedMesh.setMatrixAt(i, matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  regenerate(tunnelGeometry: THREE.BufferGeometry, nodeCount: number, seed: number = 42): void {
    this.geometry = tunnelGeometry;
    this.initialize(nodeCount, seed);
  }

  dispose(): void {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
