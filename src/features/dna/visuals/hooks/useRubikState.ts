// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useCallback, useMemo } from 'react';

interface Cubelet {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
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

const INITIAL_COLORS = {
  front: '#00ff00',   // Green
  back: '#0000ff',    // Blue
  right: '#ff0000',   // Red
  left: '#ff8800',    // Orange
  top: '#ffff00',     // Yellow
  bottom: '#ffffff'   // White
};

export function useRubikState() {
  const [rotationState, setRotationState] = useState<Map<string, [number, number, number]>>(new Map());

  // Generate the 27 cubelets (3x3x3)
  const cubelets = useMemo<Cubelet[]>(() => {
    const result: Cubelet[] = [];
    const spacing = 1.0;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const id = `${x},${y},${z}`;
          const rotation = rotationState.get(id) || [0, 0, 0];

          // Determine which faces are visible (on the outside)
          const colors = { ...INITIAL_COLORS };
          
          // Only color the faces that are on the outside
          if (x !== 1) colors.right = '#000000';
          if (x !== -1) colors.left = '#000000';
          if (y !== 1) colors.top = '#000000';
          if (y !== -1) colors.bottom = '#000000';
          if (z !== 1) colors.front = '#000000';
          if (z !== -1) colors.back = '#000000';

          result.push({
            id,
            position: [x * spacing, y * spacing, z * spacing],
            rotation,
            colors
          });
        }
      }
    }

    return result;
  }, [rotationState]);

  // Rotate a face 90 degrees
  const rotateFace = useCallback((face: Face, clockwise: boolean = true) => {
    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;

    setRotationState((prev) => {
      const next = new Map(prev);

      // Determine which cubelets are part of this face
      const affected: string[] = [];

      switch (face) {
        case 'F': // Front face (z = 1)
          cubelets.forEach((c) => {
            if (c.position[2] === 1) affected.push(c.id);
          });
          break;
        case 'B': // Back face (z = -1)
          cubelets.forEach((c) => {
            if (c.position[2] === -1) affected.push(c.id);
          });
          break;
        case 'R': // Right face (x = 1)
          cubelets.forEach((c) => {
            if (c.position[0] === 1) affected.push(c.id);
          });
          break;
        case 'L': // Left face (x = -1)
          cubelets.forEach((c) => {
            if (c.position[0] === -1) affected.push(c.id);
          });
          break;
        case 'U': // Up face (y = 1)
          cubelets.forEach((c) => {
            if (c.position[1] === 1) affected.push(c.id);
          });
          break;
        case 'D': // Down face (y = -1)
          cubelets.forEach((c) => {
            if (c.position[1] === -1) affected.push(c.id);
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
            newRotation = [current[0], current[1], current[2] + angle];
            break;
          case 'R':
          case 'L':
            newRotation = [current[0] + angle, current[1], current[2]];
            break;
          case 'U':
          case 'D':
            newRotation = [current[0], current[1] + angle, current[2]];
            break;
          default:
            newRotation = current;
        }

        next.set(id, newRotation);
      });

      return next;
    });
  }, [cubelets]);

  // Reset to solved state
  const resetCube = useCallback(() => {
    setRotationState(new Map());
  }, []);

  // Check if cube is solved (all faces same color)
  const isSolved = useCallback(() => {
    // Simple check: all rotations are back to 0 (or multiples of 2π)
    for (const rotation of rotationState.values()) {
      if (Math.abs(rotation[0] % (Math.PI * 2)) > 0.1) return false;
      if (Math.abs(rotation[1] % (Math.PI * 2)) > 0.1) return false;
      if (Math.abs(rotation[2] % (Math.PI * 2)) > 0.1) return false;
    }
    return true;
  }, [rotationState]);

  return {
    cubelets,
    rotateFace,
    resetCube,
    isSolved
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
