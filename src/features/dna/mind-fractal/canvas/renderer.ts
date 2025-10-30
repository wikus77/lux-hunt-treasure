/**
 * © 2025 Joseph MULÉ – M1SSION™ – WebGL2 Renderer
 */

import tunnelVertSrc from '../glsl/tunnel.vert.glsl?raw';
import tunnelFragSrc from '../glsl/tunnel.frag.glsl?raw';
import neuritesFragSrc from '../glsl/neurites.frag.glsl?raw';
import postBloomFragSrc from '../glsl/post_bloom.frag.glsl?raw';

interface Renderer {
  gl: WebGL2RenderingContext;
  programs: {
    tunnel: WebGLProgram;
    neurites: WebGLProgram;
    postBloom: WebGLProgram;
  };
  buffers: {
    tunnel: {
      position: WebGLBuffer;
      bary: WebGLBuffer;
      indices: WebGLBuffer;
      count: number;
    };
  };
  fbos: {
    scene: WebGLFramebuffer;
    bloom: WebGLFramebuffer;
    bloomTemp: WebGLFramebuffer;
  };
  textures: {
    scene: WebGLTexture;
    bloom: WebGLTexture;
    bloomTemp: WebGLTexture;
  };
  camera: {
    position: [number, number, number];
    rotation: [number, number];
  };
}

let renderer: Renderer | null = null;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);

  if (!vertShader || !fragShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function createTunnelGeometry(gl: WebGL2RenderingContext, rings: number, segments: number) {
  const positions: number[] = [];
  const barycentrics: number[] = [];
  const indices: number[] = [];

  // Generate cylindrical mesh
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const u = s / segments;
      const v = r / (rings - 1);
      
      positions.push(u, 0, v);
      
      // Barycentric coordinates for wireframe
      const bary = [(s % 3 === 0) ? 1 : 0, (s % 3 === 1) ? 1 : 0, (s % 3 === 2) ? 1 : 0];
      barycentrics.push(...bary);
    }
  }

  // Generate indices
  for (let r = 0; r < rings - 1; r++) {
    for (let s = 0; s < segments; s++) {
      const curr = r * segments + s;
      const next = r * segments + ((s + 1) % segments);
      const currNext = (r + 1) * segments + s;
      const nextNext = (r + 1) * segments + ((s + 1) % segments);

      indices.push(curr, next, currNext);
      indices.push(next, nextNext, currNext);
    }
  }

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const baryBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, baryBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(barycentrics), gl.STATIC_DRAW);

  const idxBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: posBuffer!,
    bary: baryBuffer!,
    indices: idxBuffer!,
    count: indices.length
  };
}

function createFramebuffer(gl: WebGL2RenderingContext, width: number, height: number) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  return { fbo: fbo!, texture: texture! };
}

export function initRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance'
  });

  if (!gl) return null;

  // Set canvas size
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Create programs
  const fullscreenVert = `#version 300 es
    in vec2 aPosition;
    out vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`;

  const tunnelProgram = createProgram(gl, tunnelVertSrc, tunnelFragSrc);
  const neuritesProgram = createProgram(gl, fullscreenVert, neuritesFragSrc);
  const postBloomProgram = createProgram(gl, fullscreenVert, postBloomFragSrc);

  if (!tunnelProgram || !neuritesProgram || !postBloomProgram) return null;

  // Create geometry
  const tunnelBuffers = createTunnelGeometry(gl, 240, 180);

  // Create framebuffers
  const sceneFBO = createFramebuffer(gl, canvas.width, canvas.height);
  const bloomFBO = createFramebuffer(gl, canvas.width / 2, canvas.height / 2);
  const bloomTempFBO = createFramebuffer(gl, canvas.width / 2, canvas.height / 2);

  renderer = {
    gl,
    programs: {
      tunnel: tunnelProgram,
      neurites: neuritesProgram,
      postBloom: postBloomProgram
    },
    buffers: {
      tunnel: tunnelBuffers
    },
    fbos: {
      scene: sceneFBO.fbo,
      bloom: bloomFBO.fbo,
      bloomTemp: bloomTempFBO.fbo
    },
    textures: {
      scene: sceneFBO.texture,
      bloom: bloomFBO.texture,
      bloomTemp: bloomTempFBO.texture
    },
    camera: {
      position: [0, 0, 3],
      rotation: [0, 0]
    }
  };

  return renderer;
}

export function renderFrame(r: Renderer, state: any) {
  const { gl } = r;

  // 1. Render tunnel to FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, r.fbos.scene);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.043, 0.063, 0.129, 1.0); // #0b1021
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Render tunnel
  gl.useProgram(r.programs.tunnel);
  // ... set uniforms and draw
  // (truncated for brevity - full matrix calculations needed)

  // 2. Extract bright areas for bloom
  // 3. Blur bloom (horizontal + vertical)
  // 4. Composite to screen
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  // Final composite render...
}

export function cleanupRenderer() {
  if (!renderer) return;
  
  const { gl } = renderer;
  // Cleanup all resources
  gl.deleteProgram(renderer.programs.tunnel);
  gl.deleteProgram(renderer.programs.neurites);
  gl.deleteProgram(renderer.programs.postBloom);
  
  renderer = null;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
