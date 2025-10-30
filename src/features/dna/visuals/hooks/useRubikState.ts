// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useCallback, useMemo } from 'react';

interface Cubelet {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  gridPos: [number, number, number]; // Grid position for 4×4 (0-3, 0-3, 0-3)
  colors: {
    front: string;
    back: string;
    right: string;
    left: string;
    top: string;
    bottom: string;
  };
}

type Face = 'F' | 'B' | 'R' | 'L' | 'U' | 'D';

// Standard Rubik's Cube colors: U=white, D=yellow, F=green, B=blue, R=red, L=orange
const FACE_COLORS = {
  top: '#ffffff',      // White (U)
  bottom: '#ffff00',   // Yellow (D)
  front: '#00ff00',    // Green (F)
  back: '#0000ff',     // Blue (B)
  right: '#ff0000',    // Red (R)
  left: '#ff8800'      // Orange (L)
};

export function useRubikState() {
  const [rotationState, setRotationState] = useState<Map<string, [number, number, number]>>(new Map());

  // Generate the 64 cubelets (4×4×4)
  const cubelets = useMemo<Cubelet[]>(() => {
    const result: Cubelet[] = [];
    const spacing = 0.75; // Reduced spacing for 4×4 to fit nicely

    // Generate 4×4×4 grid
    for (let gx = 0; gx < 4; gx++) {
      for (let gy = 0; gy < 4; gy++) {
        for (let gz = 0; gz < 4; gz++) {
          // Convert grid position (0-3) to world position (-1.5 to +1.5)
          const x = (gx - 1.5) * spacing;
          const y = (gy - 1.5) * spacing;
          const z = (gz - 1.5) * spacing;
          
          const id = `${gx},${gy},${gz}`;
          const rotation = rotationState.get(id) || [0, 0, 0];

          // Determine which faces are visible (on the outside)
          const colors = {
            front: gz === 3 ? FACE_COLORS.front : '#000000',
            back: gz === 0 ? FACE_COLORS.back : '#000000',
            right: gx === 3 ? FACE_COLORS.right : '#000000',
            left: gx === 0 ? FACE_COLORS.left : '#000000',
            top: gy === 3 ? FACE_COLORS.top : '#000000',
            bottom: gy === 0 ? FACE_COLORS.bottom : '#000000'
          };

          result.push({
            id,
            position: [x, y, z],
            gridPos: [gx, gy, gz],
            rotation,
            colors
          });
        }
      }
    }

    return result;
  }, [rotationState]);

  // Rotate a face layer (sliceIndex: 0-3, 0=outermost)
  const rotateFace = useCallback((face: Face, sliceIndex: number = 0, clockwise: boolean = true) => {
    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;

    setRotationState((prev) => {
      const next = new Map(prev);

      // Determine which cubelets are part of this slice
      const affected: string[] = [];

      switch (face) {
        case 'F': // Front face (gz = 3 - sliceIndex)
          cubelets.forEach((c) => {
            if (c.gridPos[2] === 3 - sliceIndex) affected.push(c.id);
          });
          break;
        case 'B': // Back face (gz = sliceIndex)
          cubelets.forEach((c) => {
            if (c.gridPos[2] === sliceIndex) affected.push(c.id);
          });
          break;
        case 'R': // Right face (gx = 3 - sliceIndex)
          cubelets.forEach((c) => {
            if (c.gridPos[0] === 3 - sliceIndex) affected.push(c.id);
          });
          break;
        case 'L': // Left face (gx = sliceIndex)
          cubelets.forEach((c) => {
            if (c.gridPos[0] === sliceIndex) affected.push(c.id);
          });
          break;
        case 'U': // Up face (gy = 3 - sliceIndex)
          cubelets.forEach((c) => {
            if (c.gridPos[1] === 3 - sliceIndex) affected.push(c.id);
          });
          break;
        case 'D': // Down face (gy = sliceIndex)
          cubelets.forEach((c) => {
            if (c.gridPos[1] === sliceIndex) affected.push(c.id);
          });
          break;
      }

      // Rotate the affected cubelets
      affected.forEach((id) => {
        const current = next.get(id) || [0, 0, 0];
        let newRotation: [number, number, number];

        switch (face) {
          case 'F':
          case 'B':
            newRotation = [current[0], current[1], current[2] + angle * (face === 'B' ? -1 : 1)];
            break;
          case 'R':
          case 'L':
            newRotation = [current[0] + angle * (face === 'L' ? -1 : 1), current[1], current[2]];
            break;
          case 'U':
          case 'D':
            newRotation = [current[0], current[1] + angle * (face === 'D' ? -1 : 1), current[2]];
            break;
          default:
            newRotation = current;
        }

        next.set(id, newRotation);
      });

      return next;
    });
  }, [cubelets]);

  // Scramble the cube with N random moves
  const scramble = useCallback((moves: number = 30) => {
    const faces: Face[] = ['F', 'B', 'R', 'L', 'U', 'D'];
    for (let i = 0; i < moves; i++) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      const slice = Math.floor(Math.random() * 4);
      const clockwise = Math.random() > 0.5;
      rotateFace(face, slice, clockwise);
    }
  }, [rotateFace]);

  // Reset to solved state
  const resetCube = useCallback(() => {
    setRotationState(new Map());
  }, []);

  // Check if cube is solved (all rotations are back to 0 or multiples of 2π)
  const isSolved = useCallback(() => {
    for (const rotation of rotationState.values()) {
      if (Math.abs(rotation[0] % (Math.PI * 2)) > 0.1) return false;
      if (Math.abs(rotation[1] % (Math.PI * 2)) > 0.1) return false;
      if (Math.abs(rotation[2] % (Math.PI * 2)) > 0.1) return false;
    }
    return true;
  }, [rotationState]);

  // Generate 96-char state string (6 faces × 16 stickers)
  const getStateString = useCallback((): string => {
    // For now, return a placeholder. Full implementation would track sticker positions.
    // Each face has 16 stickers (4×4), encoded as single chars: U/D/F/B/R/L
    const solved = 'U'.repeat(16) + 'D'.repeat(16) + 'F'.repeat(16) + 
                   'B'.repeat(16) + 'R'.repeat(16) + 'L'.repeat(16);
    return solved; // 96 chars total
  }, []);

  return {
    cubelets,
    rotateFace,
    scramble,
    resetCube,
    isSolved,
    getStateString
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
