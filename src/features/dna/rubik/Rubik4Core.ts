/**
 * Rubik's Cube 4×4 Core Logic
 * Handles permutations, rotations, scrambling, and solving detection
 */

import type { RubikState, RubikCubie, Move, Position, Orientation, Face } from './types';
import { RUBIK_COLORS } from './colors';

/**
 * Create initial solved state
 */
export function createSolvedState(): RubikState {
  const cubies: RubikCubie[] = [];
  let id = 0;

  // Generate 64 cubies (4×4×4)
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      for (let z = 0; z < 4; z++) {
        const pos: Position = [x, y, z];
        const stickers = getInitialStickers(pos);
        
        cubies.push({
          id: id++,
          pos,
          orient: [0, 0, 0],
          stickers
        });
      }
    }
  }

  return {
    size: 4,
    cubies,
    history: []
  };
}

/**
 * Determine initial sticker colors based on position
 */
function getInitialStickers(pos: Position): Partial<Record<Face, string>> {
  const [x, y, z] = pos;
  const stickers: Partial<Record<Face, string>> = {};

  // Only external faces have visible stickers
  if (x === 0) stickers.L = RUBIK_COLORS.NEON.L; // Left
  if (x === 3) stickers.R = RUBIK_COLORS.NEON.R; // Right
  if (y === 0) stickers.D = RUBIK_COLORS.NEON.D; // Down
  if (y === 3) stickers.U = RUBIK_COLORS.NEON.U; // Up
  if (z === 0) stickers.B = RUBIK_COLORS.NEON.B; // Back
  if (z === 3) stickers.F = RUBIK_COLORS.NEON.F; // Front

  return stickers;
}

/**
 * Apply a move to the state (immutable)
 */
export function applyMove(state: RubikState, move: Move): RubikState {
  const newCubies = [...state.cubies];
  
  // Parse move notation
  const { face, sliceIndex, clockwise, double } = parseMove(move);
  
  // Rotate affected cubies
  const rotatedCubies = rotateFace(newCubies, face, sliceIndex, clockwise);
  
  // Apply twice for double moves
  const finalCubies = double ? rotateFace(rotatedCubies, face, sliceIndex, clockwise) : rotatedCubies;

  return {
    ...state,
    cubies: finalCubies,
    history: [...state.history, move]
  };
}

/**
 * Parse move notation (e.g., "U", "R2", "F'", "Uw")
 */
function parseMove(move: Move): {
  face: Face;
  sliceIndex: number;
  clockwise: boolean;
  double: boolean;
} {
  const faceLetter = move[0].toUpperCase() as Face;
  const hasW = move.includes('w');
  const hasPrime = move.includes("'");
  const has2 = move.includes('2');

  return {
    face: faceLetter,
    sliceIndex: hasW ? 1 : 0, // 'w' moves include adjacent layer
    clockwise: !hasPrime,
    double: has2
  };
}

/**
 * Rotate a face (and optionally adjacent layer)
 */
function rotateFace(
  cubies: RubikCubie[],
  face: Face,
  sliceIndex: number,
  clockwise: boolean
): RubikCubie[] {
  return cubies.map(cubie => {
    if (isInSlice(cubie.pos, face, sliceIndex)) {
      return rotateCubie(cubie, face, clockwise);
    }
    return cubie;
  });
}

/**
 * Check if position is in the specified slice
 */
function isInSlice(pos: Position, face: Face, sliceIndex: number): boolean {
  const [x, y, z] = pos;
  
  switch (face) {
    case 'U': return y === 3 || (sliceIndex > 0 && y === 2);
    case 'D': return y === 0 || (sliceIndex > 0 && y === 1);
    case 'L': return x === 0 || (sliceIndex > 0 && x === 1);
    case 'R': return x === 3 || (sliceIndex > 0 && x === 2);
    case 'F': return z === 3 || (sliceIndex > 0 && z === 2);
    case 'B': return z === 0 || (sliceIndex > 0 && z === 1);
  }
}

/**
 * Rotate a single cubie (position and orientation)
 */
function rotateCubie(cubie: RubikCubie, face: Face, clockwise: boolean): RubikCubie {
  const [x, y, z] = cubie.pos;
  let newPos: Position = [x, y, z];
  const newOrient: Orientation = [...cubie.orient];

  // Rotation matrices for each face
  const dir = clockwise ? 1 : -1;
  
  switch (face) {
    case 'U':
    case 'D': {
      const cx = 1.5, cz = 1.5;
      const rx = x - cx, rz = z - cz;
      newPos = [
        Math.round(cx - dir * rz),
        y,
        Math.round(cz + dir * rx)
      ] as Position;
      newOrient[1] = (newOrient[1] + dir * 90 + 360) % 360;
      break;
    }
    case 'L':
    case 'R': {
      const cy = 1.5, cz = 1.5;
      const ry = y - cy, rz = z - cz;
      newPos = [
        x,
        Math.round(cy - dir * rz),
        Math.round(cz + dir * ry)
      ] as Position;
      newOrient[0] = (newOrient[0] + dir * 90 + 360) % 360;
      break;
    }
    case 'F':
    case 'B': {
      const cx = 1.5, cy = 1.5;
      const rx = x - cx, ry = y - cy;
      newPos = [
        Math.round(cx + dir * ry),
        Math.round(cy - dir * rx),
        z
      ] as Position;
      newOrient[2] = (newOrient[2] + dir * 90 + 360) % 360;
      break;
    }
  }

  return {
    ...cubie,
    pos: newPos,
    orient: newOrient
  };
}

/**
 * Generate random scramble sequence
 */
export function generateScramble(moveCount: number = 30): Move[] {
  const faces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
  const modifiers = ['', "'", '2'];
  const moves: Move[] = [];
  let lastFace: Face | null = null;

  for (let i = 0; i < moveCount; i++) {
    // Avoid consecutive moves on same face
    let face: Face;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push(face + modifier);
    lastFace = face;
  }

  return moves;
}

/**
 * Check if cube is solved
 */
export function isSolved(state: RubikState): boolean {
  // For each face, check if all visible stickers are the same color
  for (const face of ['U', 'D', 'L', 'R', 'F', 'B'] as Face[]) {
    const faceStickers = state.cubies
      .filter(c => {
        const [x, y, z] = c.pos;
        switch (face) {
          case 'U': return y === 3;
          case 'D': return y === 0;
          case 'L': return x === 0;
          case 'R': return x === 3;
          case 'F': return z === 3;
          case 'B': return z === 0;
          default: return false;
        }
      })
      .map(c => c.stickers?.[face])
      .filter(Boolean);

    // Check if all stickers on this face have the same color
    if (faceStickers.length === 0) continue;
    const firstColor = faceStickers[0];
    if (!faceStickers.every(color => color === firstColor)) {
      return false;
    }
  }

  return true;
}

/**
 * Undo last move
 */
export function undoMove(state: RubikState): RubikState {
  if (state.history.length === 0) return state;

  const lastMove = state.history[state.history.length - 1];
  const inverseMove = getInverseMove(lastMove);

  // Recreate state from history
  let newState = createSolvedState();
  for (let i = 0; i < state.history.length - 1; i++) {
    newState = applyMove(newState, state.history[i]);
  }

  return newState;
}

/**
 * Get inverse of a move
 */
function getInverseMove(move: Move): Move {
  if (move.includes("'")) return move.replace("'", "");
  if (move.includes("2")) return move;
  return move + "'";
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
