/**
 * © 2025 Joseph MULÉ – M1SSION™ – Starfield Generator
 */

export interface Star {
  x: number;
  y: number;
  z: number;
  brightness: number;
  phase: number;
}

export function generateStarfield(count: number, seed: number): Star[] {
  const stars: Star[] = [];
  
  // Simple seeded random
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  for (let i = 0; i < count; i++) {
    stars.push({
      x: (rand() - 0.5) * 100,
      y: (rand() - 0.5) * 100,
      z: rand() * 50 + 10,
      brightness: rand() * 0.8 + 0.2,
      phase: rand() * Math.PI * 2
    });
  }

  return stars;
}

export function updateStarfield(stars: Star[], time: number, cameraZ: number) {
  stars.forEach(star => {
    // Parallax effect
    const parallaxFactor = (50 - star.z) / 50;
    
    // Twinkle effect
    star.brightness = 0.5 + Math.sin(star.phase + time * 2) * 0.3;
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
