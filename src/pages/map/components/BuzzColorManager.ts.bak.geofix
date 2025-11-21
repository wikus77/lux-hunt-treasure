
// Color management utility for BUZZ areas
export const BUZZ_NEON_COLOR = '#00FFFF'; // Azzurro neon fisso M1SSION

export const getCurrentColor = (): string => {
  console.log('🎨 BUZZ COLOR - Using fixed neon cyan:', BUZZ_NEON_COLOR);
  return BUZZ_NEON_COLOR;
};

export const getCurrentColorName = (): string => {
  return 'AZZURRO NEON';
};

export const getBuzzGlowStyles = (currentColor: string): string => {
  return `
    .buzz-map-area-direct {
      filter: drop-shadow(0 0 12px ${currentColor}77);
      animation: buzzGlow 3s infinite ease-in-out;
      z-index: 1000 !important;
    }
    
    @keyframes buzzGlow {
      0% { filter: drop-shadow(0 0 6px ${currentColor}55); }
      50% { filter: drop-shadow(0 0 18px ${currentColor}99); }
      100% { filter: drop-shadow(0 0 6px ${currentColor}55); }
    }
  `;
};
