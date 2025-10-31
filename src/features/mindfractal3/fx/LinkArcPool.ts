// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import * as THREE from 'three';

interface LinkArc {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  birthTime: number;
  lifetime: number;
}

const linkArcVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const linkArcFragmentShader = `
uniform float uTime;
uniform float uLifetimeRatio;
varying vec2 vUv;

void main() {
  float wave = sin(vUv.x * 10.0 - uTime * 15.0) * 0.5 + 0.5;
  float taper = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
  
  vec3 white = vec3(1.5, 1.5, 1.5);
  float alpha = wave * taper * (1.0 - uLifetimeRatio) * 0.9;
  
  gl_FragColor = vec4(white, alpha);
}
`;

/**
 * Link Arc Pool - rapid white arcs for user-created links
 */
export class LinkArcPool {
  private scene: THREE.Scene;
  private edges: Array<[THREE.Vector3, THREE.Vector3]>;
  private arcs: LinkArc[] = [];

  constructor(scene: THREE.Scene, edges: Array<[THREE.Vector3, THREE.Vector3]>) {
    this.scene = scene;
    this.edges = edges;
  }

  updateEdges(edges: Array<[THREE.Vector3, THREE.Vector3]>): void {
    this.edges = edges;
  }

  spawnLinkArc(start: THREE.Vector3, end: THREE.Vector3): void {
    // Direct path with slight curve
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const offset = new THREE.Vector3()
      .subVectors(end, start)
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize()
      .multiplyScalar(0.2);
    mid.add(offset);

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const tubeRadius = 0.022; // Thin for precision
    const geometry = new THREE.TubeGeometry(curve, 24, tubeRadius, 6, false);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLifetimeRatio: { value: 0 }
      },
      vertexShader: linkArcVertexShader,
      fragmentShader: linkArcFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    const lifetime = 0.35 + Math.random() * 0.15; // 0.35-0.5s

    this.arcs.push({
      mesh,
      material,
      birthTime: performance.now(),
      lifetime: lifetime * 1000
    });
  }

  update(deltaTime: number): void {
    const now = performance.now();

    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const arc = this.arcs[i];
      const age = now - arc.birthTime;
      const ratio = age / arc.lifetime;

      if (ratio >= 1.0) {
        this.scene.remove(arc.mesh);
        arc.mesh.geometry.dispose();
        arc.material.dispose();
        this.arcs.splice(i, 1);
      } else {
        arc.material.uniforms.uTime.value += deltaTime;
        arc.material.uniforms.uLifetimeRatio.value = ratio;
      }
    }
  }

  dispose(): void {
    for (const arc of this.arcs) {
      this.scene.remove(arc.mesh);
      arc.mesh.geometry.dispose();
      arc.material.dispose();
    }
    this.arcs = [];
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
