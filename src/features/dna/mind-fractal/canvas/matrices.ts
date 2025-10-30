/**
 * © 2025 Joseph MULÉ – M1SSION™ – Matrix Math Utilities
 */

/**
 * Create perspective projection matrix
 */
export function createProjectionMatrix(
  fov: number,
  aspect: number,
  near: number,
  far: number
): Float32Array {
  const f = 1.0 / Math.tan(fov * 0.5);
  const nf = 1 / (near - far);
  
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0
  ]);
}

/**
 * Create view matrix from camera position and rotation
 */
export function createViewMatrix(
  position: [number, number, number],
  rotation: [number, number]
): Float32Array {
  const [x, y, z] = position;
  const [pitch, yaw] = rotation;
  
  // Create rotation matrices
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  
  // Combined rotation and translation
  const matrix = new Float32Array(16);
  
  // Rotation around Y (yaw)
  matrix[0] = cosYaw;
  matrix[1] = 0;
  matrix[2] = sinYaw;
  matrix[3] = 0;
  
  matrix[4] = sinYaw * sinPitch;
  matrix[5] = cosPitch;
  matrix[6] = -cosYaw * sinPitch;
  matrix[7] = 0;
  
  matrix[8] = -sinYaw * cosPitch;
  matrix[9] = sinPitch;
  matrix[10] = cosYaw * cosPitch;
  matrix[11] = 0;
  
  // Translation
  matrix[12] = -x;
  matrix[13] = -y;
  matrix[14] = -z;
  matrix[15] = 1;
  
  return matrix;
}

/**
 * Identity matrix
 */
export function identityMatrix(): Float32Array {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
