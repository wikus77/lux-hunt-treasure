// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

uniform float uTime;
uniform float uLifetimeRatio;
uniform float uFieldIntensity;
varying vec2 vUv;

// Simple noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  float t = vUv.x - uTime * 2.0;
  float wave = noise(vec2(t * 8.0, uTime * 3.0)) * 0.5 + 0.5;
  
  // Taper from center to edges
  float taper = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
  
  // Cyan (#35E9FF) to violet (#A64DFF) gradient with white spike
  vec3 cyan = vec3(0.208, 0.914, 1.0);    // #35E9FF
  vec3 violet = vec3(0.651, 0.302, 1.0);  // #A64DFF
  vec3 white = vec3(1.5, 1.5, 1.5);
  
  vec3 color = mix(cyan, violet, vUv.x);
  
  // White spike at wave peak
  if (wave > 0.85) {
    color = mix(color, white, (wave - 0.85) / 0.15);
  }
  
  // Apply field intensity modulation
  float intensityMod = mix(0.8, 1.2, uFieldIntensity);
  
  float alpha = wave * taper * (1.0 - uLifetimeRatio) * intensityMod;
  
  gl_FragColor = vec4(color, alpha);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
