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
    'BUZZ MAPPA Gratis': '/map?buzzFree=1',
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
    color: '#00FFFF',
    glow: '#00FFFF',
    short: 'BUZZ x1'
  },
  'BUZZ x2': {
    color: '#00FFFF',
    glow: '#00FFFF',
    short: 'BUZZ x2'
  },
  'Indizio Extra': {
    color: '#8A2BE2',
    glow: '#8A2BE2',
    short: 'Indizio Extra'
  },
  'Missione Fallita': {
    color: '#555555',
    glow: '#555555',
    short: 'Fallita'
  },
  'Nessun Premio': {
    color: '#555555',
    glow: '#555555',
    short: 'Nessun Premio'
  },
  'Clue di Settimana 4': {
    color: '#FFD700',
    glow: '#FFD700',
    short: 'Clue W4'
  },
  'BUZZ MAPPA Gratis': {
    color: '#FFD700',
    glow: '#FFD700',
    short: 'BUZZ MAPPA'
  },
  '3h senza blocchi BUZZ': {
    color: '#8A2BE2',
    glow: '#8A2BE2',
    short: '3h Free'
  },
  'Premio Random': {
    color: '#FFD700',
    glow: '#FFD700',
    short: 'Premio Random'
  }
};