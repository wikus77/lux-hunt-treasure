/**
 * © 2025 Joseph MULÉ – M1SSION™ – WebGL2 Renderer
 */

import tunnelVertSrc from '../glsl/tunnel.vert.glsl?raw';
import tunnelFragSrc from '../glsl/tunnel.frag.glsl?raw';
import neuritesFragSrc from '../glsl/neurites.frag.glsl?raw';
import postBloomFragSrc from '../glsl/post_bloom.frag.glsl?raw';
import { createProjectionMatrix, createViewMatrix } from './matrices';
import { createFullscreenQuad, drawFullscreenQuad } from './fullscreenQuad';

interface Renderer {
  gl: WebGL2RenderingContext;
  programs: {
    tunnel: WebGLProgram;
    neurites: WebGLProgram;
    postBloom: WebGLProgram;
    blit: WebGLProgram;
  };
  buffers: {
    tunnel: {
      position: WebGLBuffer;
      bary: WebGLBuffer;
      indices: WebGLBuffer;
      count: number;
    };
    quad: {
      buffer: WebGLBuffer;
      vao: WebGLVertexArrayObject;
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
    fov: number;
  };
}

let renderer: Renderer | null = null;

// Debug options with safe defaults
let debugOptions = {
  bypassPost: false,
  reduceMesh: false,
};
let reducedMeshApplied = false;
let firstFramePresented = false;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string, name: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error(`[MF] Failed to create shader: ${name}`);
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    console.error(`[MF] Shader compile error (${name}):`, log);
    gl.deleteShader(shader);
    return null;
  }

  console.log(`[MF] Shader compiled OK: ${name}`);
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string, name: string): WebGLProgram | null {
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSrc, `${name}.vert`);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc, `${name}.frag`);

  if (!vertShader || !fragShader) {
    console.error(`[MF] Failed to compile shaders for program: ${name}`);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    console.error(`[MF] Failed to create program: ${name}`);
    return null;
  }

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    console.error(`[MF] Program link error (${name}):`, log);
    return null;
  }

  console.log(`[MF] Program linked OK: ${name}`);
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
      
      // Barycentric coordinates for wireframe (proper per-triangle coords)
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
  if (!texture) {
    console.error('[MF] Failed to create texture');
    throw new Error('Failed to create texture');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Use RGBA8 + UNSIGNED_BYTE for iOS compatibility
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer();
  if (!fbo) {
    console.error('[MF] Failed to create framebuffer');
    throw new Error('Failed to create framebuffer');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    console.error('[MF] Framebuffer incomplete:', {
      status,
      FRAMEBUFFER_INCOMPLETE_ATTACHMENT: gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT,
      FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,
      FRAMEBUFFER_INCOMPLETE_DIMENSIONS: gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS,
      FRAMEBUFFER_UNSUPPORTED: gl.FRAMEBUFFER_UNSUPPORTED
    });
  }

  return { fbo, texture };
}

export function initRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });

  if (!gl) {
    console.error('[MF] Failed to get WebGL2 context');
    return null;
  }

  // Set canvas size
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  gl.viewport(0, 0, canvas.width, canvas.height);

  console.log('[MF] Canvas backing store', {
    width: canvas.width,
    height: canvas.height,
    dpr
  });

  // Create programs
  const fullscreenVert = `#version 300 es
    layout(location = 0) in vec2 aPosition;
    out vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`;

  console.log('[MF] Compiling shaders...');
  const tunnelProgram = createProgram(gl, tunnelVertSrc, tunnelFragSrc, 'tunnel');
  const neuritesProgram = createProgram(gl, fullscreenVert, neuritesFragSrc, 'neurites');
  const postBloomProgram = createProgram(gl, fullscreenVert, postBloomFragSrc, 'postBloom');
  // Simple blit (copy) program for failover bypass
  const blitFrag = `#version 300 es\nprecision highp float;\nin vec2 vUv;\nuniform sampler2D uTex;\nout vec4 fragColor;\nvoid main(){ fragColor = texture(uTex, vUv); }`;
  const blitProgram = createProgram(gl, fullscreenVert, blitFrag, 'blit');

  if (!tunnelProgram || !neuritesProgram || !postBloomProgram || !blitProgram) {
    console.error('[MF] Failed to create shader programs');
    return null;
  }

  console.log('[MF] Shaders compiled successfully', {
    tunnel: !!tunnelProgram,
    neurites: !!neuritesProgram,
    postBloom: !!postBloomProgram,
    blit: !!blitProgram
  });

  // Log uniform locations for tunnel program
  gl.useProgram(tunnelProgram);
  const tunnelUniforms = {
    uProjection: gl.getUniformLocation(tunnelProgram, 'uProjection'),
    uView: gl.getUniformLocation(tunnelProgram, 'uView'),
    uTime: gl.getUniformLocation(tunnelProgram, 'uTime'),
    uSeed: gl.getUniformLocation(tunnelProgram, 'uSeed')
  };
  console.log('[MF] Tunnel uniform locations', {
    uProjection: tunnelUniforms.uProjection !== null,
    uView: tunnelUniforms.uView !== null,
    uTime: tunnelUniforms.uTime !== null,
    uSeed: tunnelUniforms.uSeed !== null
  });

  // Log uniform locations for post program
  gl.useProgram(postBloomProgram);
  const postUniforms = {
    uPass: gl.getUniformLocation(postBloomProgram, 'uPass'),
    uScene: gl.getUniformLocation(postBloomProgram, 'uScene'),
    uBloom: gl.getUniformLocation(postBloomProgram, 'uBloom'),
    uResolution: gl.getUniformLocation(postBloomProgram, 'uResolution'),
    uBloomIntensity: gl.getUniformLocation(postBloomProgram, 'uBloomIntensity')
  };
  console.log('[MF] Post uniform locations', {
    uPass: postUniforms.uPass !== null,
    uScene: postUniforms.uScene !== null,
    uBloom: postUniforms.uBloom !== null,
    uResolution: postUniforms.uResolution !== null,
    uBloomIntensity: postUniforms.uBloomIntensity !== null
  });

  // Create geometry
  const tunnelBuffers = createTunnelGeometry(gl, 240, 180);
  const quad = createFullscreenQuad(gl);

  console.log('[MF] Geometry created', {
    tunnelTriangles: tunnelBuffers.count / 3,
    quadVAO: !!quad.vao
  });

  // Create framebuffers
  console.log('[MF] Creating framebuffers...');
  const sceneFBO = createFramebuffer(gl, canvas.width, canvas.height);
  const bloomFBO = createFramebuffer(gl, Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
  const bloomTempFBO = createFramebuffer(gl, Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));

  // Verify FBO status
  gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFBO.fbo);
  const sceneStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  console.log('[MF] FBO scene status', {
    complete: sceneStatus === gl.FRAMEBUFFER_COMPLETE,
    status: sceneStatus
  });

  gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFBO.fbo);
  const bloomStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  console.log('[MF] FBO bloom status', {
    complete: bloomStatus === gl.FRAMEBUFFER_COMPLETE,
    status: bloomStatus
  });

  gl.bindFramebuffer(gl.FRAMEBUFFER, bloomTempFBO.fbo);
  const bloomTempStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  console.log('[MF] FBO bloomTemp status', {
    complete: bloomTempStatus === gl.FRAMEBUFFER_COMPLETE,
    status: bloomTempStatus
  });

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  if (sceneStatus !== gl.FRAMEBUFFER_COMPLETE || 
      bloomStatus !== gl.FRAMEBUFFER_COMPLETE || 
      bloomTempStatus !== gl.FRAMEBUFFER_COMPLETE) {
    console.error('[MF] One or more framebuffers incomplete');
    return null;
  }

  renderer = {
    gl,
    programs: {
      tunnel: tunnelProgram,
      neurites: neuritesProgram,
      postBloom: postBloomProgram,
      blit: blitProgram
    },
    buffers: {
      tunnel: tunnelBuffers,
      quad
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
      rotation: [0, 0],
      fov: (65 * Math.PI) / 180
    }
  };

  console.log('[MF] Renderer initialized successfully');
  return renderer;
}

export function resizeRenderer() {
  if (!renderer) {
    console.warn('[MF] resizeRenderer called but no renderer exists');
    return;
  }
  
  const { gl } = renderer;
  const canvas = gl.canvas as HTMLCanvasElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const newWidth = Math.floor(canvas.clientWidth * dpr);
  const newHeight = Math.floor(canvas.clientHeight * dpr);

  if (canvas.width === newWidth && canvas.height === newHeight) {
    console.log('[MF] resize: dimensions unchanged, skipping');
    return;
  }

  console.log('[MF] resize: recreating FBOs', { 
    oldWidth: canvas.width, 
    oldHeight: canvas.height,
    newWidth, 
    newHeight 
  });

  // Resize canvas and viewport
  canvas.width = newWidth;
  canvas.height = newHeight;
  gl.viewport(0, 0, newWidth, newHeight);

  // Delete old FBOs and textures
  gl.deleteFramebuffer(renderer.fbos.scene);
  gl.deleteFramebuffer(renderer.fbos.bloom);
  gl.deleteFramebuffer(renderer.fbos.bloomTemp);
  gl.deleteTexture(renderer.textures.scene);
  gl.deleteTexture(renderer.textures.bloom);
  gl.deleteTexture(renderer.textures.bloomTemp);

  // Recreate FBOs with new dimensions
  const sceneFBO = createFramebuffer(gl, newWidth, newHeight);
  const bloomFBO = createFramebuffer(gl, Math.floor(newWidth / 2), Math.floor(newHeight / 2));
  const bloomTempFBO = createFramebuffer(gl, Math.floor(newWidth / 2), Math.floor(newHeight / 2));

  renderer.fbos.scene = sceneFBO.fbo;
  renderer.fbos.bloom = bloomFBO.fbo;
  renderer.fbos.bloomTemp = bloomTempFBO.fbo;
  renderer.textures.scene = sceneFBO.texture;
  renderer.textures.bloom = bloomFBO.texture;
  renderer.textures.bloomTemp = bloomTempFBO.texture;

  console.log('[MF] resize complete');
}

export function setDebugOptions(opts: { bypassPost?: boolean; reduceMesh?: boolean }) {
  debugOptions = { ...debugOptions, ...opts };
  console.log('[MF] failover: setDebugOptions', debugOptions);
}



export function renderFrame(r: Renderer, state: { time: number; seed: number; connections: number; moves: number }) {
  const { gl } = r;
  const canvas = gl.canvas as HTMLCanvasElement;
  const aspect = canvas.width / canvas.height;

  // Create matrices
  const projectionMatrix = createProjectionMatrix(r.camera.fov, aspect, 0.1, 120);
  const viewMatrix = createViewMatrix(r.camera.position, r.camera.rotation);

  // Apply reduced mesh once if requested
  if (debugOptions.reduceMesh && !reducedMeshApplied) {
    console.log('[MF] Applying reduced mesh (rings=48, segments=64)');
    const { gl } = r;
    gl.deleteBuffer(r.buffers.tunnel.position);
    gl.deleteBuffer(r.buffers.tunnel.bary);
    gl.deleteBuffer(r.buffers.tunnel.indices);
    const newBuffers = createTunnelGeometry(gl, 48, 64);
    r.buffers.tunnel = newBuffers as any;
    reducedMeshApplied = true;
  }

  // ===== PASS 1: Render tunnel to scene FBO =====
  gl.bindFramebuffer(gl.FRAMEBUFFER, r.fbos.scene);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Pure black
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Draw tunnel
  gl.useProgram(r.programs.tunnel);
  
  // Set uniforms
  const uProjection = gl.getUniformLocation(r.programs.tunnel, 'uProjection');
  const uView = gl.getUniformLocation(r.programs.tunnel, 'uView');
  const uTime = gl.getUniformLocation(r.programs.tunnel, 'uTime');
  const uSeed = gl.getUniformLocation(r.programs.tunnel, 'uSeed');
  
  gl.uniformMatrix4fv(uProjection, false, projectionMatrix);
  gl.uniformMatrix4fv(uView, false, viewMatrix);
  gl.uniform1f(uTime, state.time);
  gl.uniform1f(uSeed, state.seed);
  
  // Bind attributes
  const aPosition = gl.getAttribLocation(r.programs.tunnel, 'aPosition');
  const aBary = gl.getAttribLocation(r.programs.tunnel, 'aBary');
  
  gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.tunnel.position);
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.tunnel.bary);
  gl.enableVertexAttribArray(aBary);
  gl.vertexAttribPointer(aBary, 3, gl.FLOAT, false, 0, 0);
  
  // Draw tunnel
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, r.buffers.tunnel.indices);
  gl.drawElements(gl.TRIANGLES, r.buffers.tunnel.count, gl.UNSIGNED_SHORT, 0);

  // ===== PASS 2: Threshold - Extract bright areas from scene =====
  const bloomWidth = Math.floor(canvas.width / 2);
  const bloomHeight = Math.floor(canvas.height / 2);
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, r.fbos.bloom);
  gl.viewport(0, 0, bloomWidth, bloomHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);
  
  gl.useProgram(r.programs.postBloom);
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uPass'), 0); // Threshold
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uScene'), 0);
  gl.uniform2f(gl.getUniformLocation(r.programs.postBloom, 'uResolution'), bloomWidth, bloomHeight);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, r.textures.scene);
  
  drawFullscreenQuad(gl, r.buffers.quad.vao);

  // ===== PASS 3: Horizontal blur =====
  gl.bindFramebuffer(gl.FRAMEBUFFER, r.fbos.bloomTemp);
  gl.viewport(0, 0, bloomWidth, bloomHeight);
  
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uPass'), 1); // Blur H
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uBloom'), 0);
  gl.uniform2f(gl.getUniformLocation(r.programs.postBloom, 'uResolution'), bloomWidth, bloomHeight);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, r.textures.bloom);
  
  drawFullscreenQuad(gl, r.buffers.quad.vao);

  // ===== PASS 4: Vertical blur =====
  gl.bindFramebuffer(gl.FRAMEBUFFER, r.fbos.bloom);
  gl.viewport(0, 0, bloomWidth, bloomHeight);
  
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uPass'), 2); // Blur V
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uBloom'), 0);
  gl.uniform2f(gl.getUniformLocation(r.programs.postBloom, 'uResolution'), bloomWidth, bloomHeight);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, r.textures.bloomTemp);
  
  drawFullscreenQuad(gl, r.buffers.quad.vao);

  // ===== PASS 5: Composite to screen =====
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uPass'), 3); // Composite
  gl.uniform1f(gl.getUniformLocation(r.programs.postBloom, 'uBloomIntensity'), 0.7);
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uScene'), 0);
  gl.uniform1i(gl.getUniformLocation(r.programs.postBloom, 'uBloom'), 1);
  gl.uniform2f(gl.getUniformLocation(r.programs.postBloom, 'uResolution'), canvas.width, canvas.height);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, r.textures.scene);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, r.textures.bloom);
  
  drawFullscreenQuad(gl, r.buffers.quad.vao);
}

export function cleanupRenderer() {
  if (!renderer) return;
  
  const { gl } = renderer;
  
  // Delete programs
  gl.deleteProgram(renderer.programs.tunnel);
  gl.deleteProgram(renderer.programs.neurites);
  gl.deleteProgram(renderer.programs.postBloom);
  gl.deleteProgram(renderer.programs.blit);
  
  // Delete buffers
  gl.deleteBuffer(renderer.buffers.tunnel.position);
  gl.deleteBuffer(renderer.buffers.tunnel.bary);
  gl.deleteBuffer(renderer.buffers.tunnel.indices);
  gl.deleteBuffer(renderer.buffers.quad.buffer);
  
  // Delete framebuffers and textures
  gl.deleteFramebuffer(renderer.fbos.scene);
  gl.deleteFramebuffer(renderer.fbos.bloom);
  gl.deleteFramebuffer(renderer.fbos.bloomTemp);
  gl.deleteTexture(renderer.textures.scene);
  gl.deleteTexture(renderer.textures.bloom);
  gl.deleteTexture(renderer.textures.bloomTemp);
  
  renderer = null;
  console.log('[Mind Fractal] Renderer cleaned up');
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
