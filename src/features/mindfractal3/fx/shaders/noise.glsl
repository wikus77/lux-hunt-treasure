// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

// Simple 1D Perlin-like noise
float noise1D(float x) {
  float i = floor(x);
  float f = x - i;
  float u = f * f * (3.0 - 2.0 * f);
  
  float a = fract(sin(i * 12.9898 + 78.233) * 43758.5453123);
  float b = fract(sin((i + 1.0) * 12.9898 + 78.233) * 43758.5453123);
  
  return a * (1.0 - u) + b * u;
}

// 2D noise
float noise2D(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
