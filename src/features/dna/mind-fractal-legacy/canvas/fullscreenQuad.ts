/**
 * © 2025 Joseph MULÉ – M1SSION™ – Fullscreen Quad for Post-Processing
 */

/**
 * Create a fullscreen quad for post-processing effects
 */
export function createFullscreenQuad(gl: WebGL2RenderingContext): {
  buffer: WebGLBuffer;
  vao: WebGLVertexArrayObject;
} {
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1
  ]);
  
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error('Failed to create fullscreen quad buffer');
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  
  // Create VAO for easy binding
  const vao = gl.createVertexArray();
  if (!vao) throw new Error('Failed to create VAO');
  
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  
  return { buffer, vao };
}

/**
 * Draw fullscreen quad
 */
export function drawFullscreenQuad(
  gl: WebGL2RenderingContext,
  vao: WebGLVertexArrayObject
): void {
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.bindVertexArray(null);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
