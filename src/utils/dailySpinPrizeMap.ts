// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { SEGMENTS } from './dailySpinUtils';

/**
 * Map rotation degrees to prize and redirect path
 */
export const mapRotationToPrize = (rotationDeg: number) => {
  const normalizedDeg = ((rotationDeg % 360) + 360) % 360;
  const segmentAngle = 360 / 12; // 30 degrees per segment
  const segmentIndex = Math.floor(normalizedDeg / segmentAngle);
  const prize = SEGMENTS[segmentIndex] || SEGMENTS[0];
  
  // Prize to redirect mapping
  const redirectMap: Record<string, string> = {
    'BUZZ x1': '/buzz',
    'BUZZ x2': '/buzz', 
    'BUZZ MAPPA gratis': '/map?buzzFree=1',
    'Clue di Settimana 4': '/clues?week=4',
    'Premio Random': '/prizes',
    '3h senza blocchi BUZZ': '/home',
    'Indizio Extra': '/clues'
  };
  
  return {
    prize,
    reroute_path: redirectMap[prize] || null,
    segment_index: segmentIndex,
    rotation_deg: rotationDeg
  };
};

/**
 * Prize display configuration for UI
 */
export const PRIZE_CONFIG = {
  'BUZZ x1': {
    emoji: '⚡',
    color: '#FFD700',
    glow: '#FFD700',
    short: 'BUZZ x1'
  },
  'BUZZ x2': {
    emoji: '⚡⚡',
    color: '#FF6B35',
    glow: '#FF6B35',
    short: 'BUZZ x2'
  },
  'Indizio Extra': {
    emoji: '🔍',
    color: '#00BFFF',
    glow: '#00BFFF',
    short: 'Indizio+'
  },
  'Missione Fallita': {
    emoji: '💥',
    color: '#FF4444',
    glow: '#FF4444',
    short: 'Fallita'
  },
  'Nessun premio': {
    emoji: '😞',
    color: '#666666',
    glow: '#666666',
    short: 'Nessuno'
  },
  'Clue di Settimana 4': {
    emoji: '🎯',
    color: '#9D4EDD',
    glow: '#9D4EDD',
    short: 'Clue S4'
  },
  'BUZZ MAPPA gratis': {
    emoji: '🗺️',
    color: '#00FF88',
    glow: '#00FF88',
    short: 'BUZZ MAP'
  },
  '3h senza blocchi BUZZ': {
    emoji: '⏰',
    color: '#FF69B4',
    glow: '#FF69B4',
    short: '3h Free'
  },
  'Premio Random': {
    emoji: '🎁',
    color: '#FFB347',
    glow: '#FFB347',
    short: 'Random'
  }
};