
// Color management utility for BUZZ areas
export const NEON_COLORS = ['#FFFF00', '#FF00FF', '#00FF00', '#FF66CC']; // Yellow, Pink, Green, Fuchsia
export const NEON_COLOR_NAMES = ['GIALLO NEON', 'ROSA NEON', 'VERDE NEON', 'FUCSIA NEON'];

export const getCurrentColor = (buzzCounter: number): string => {
  const colorIndex = buzzCounter % 4;
  const selectedColor = NEON_COLORS[colorIndex];
  console.log('🎨 DYNAMIC COLOR - Selected color for generation', buzzCounter + 1, ':', selectedColor, '(index:', colorIndex, ')');
  return selectedColor;
};

export const getCurrentColorName = (buzzCounter: number): string => {
  const colorIndex = buzzCounter % 4;
  return NEON_COLOR_NAMES[colorIndex];
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
