// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

uniform float uTime;
uniform float uLifetimeRatio;
varying vec2 vUv;

vec3 hueShift(vec3 color, float shift) {
  float angle = shift * 3.14159265;
  float s = sin(angle);
  float c = cos(angle);
  mat3 rotMat = mat3(
    c + (1.0 - c) / 3.0, (1.0 - c) / 3.0 - s * 0.577, (1.0 - c) / 3.0 + s * 0.577,
    (1.0 - c) / 3.0 + s * 0.577, c + (1.0 - c) / 3.0, (1.0 - c) / 3.0 - s * 0.577,
    (1.0 - c) / 3.0 - s * 0.577, (1.0 - c) / 3.0 + s * 0.577, c + (1.0 - c) / 3.0
  );
  return rotMat * color;
}

void main() {
  // Traveling wave along arc
  float wave = sin(vUv.x * 8.0 - uTime * 12.0) * 0.5 + 0.5;
  
  // Taper at ends
  float taper = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
  
  // White spike in middle 10-15% of lifetime
  float spikeWindow = smoothstep(0.1, 0.15, uLifetimeRatio) * smoothstep(0.25, 0.2, uLifetimeRatio);
  
  // Gradient cyan → violet
  vec3 cyan = vec3(0.2, 0.9, 1.0);
  vec3 violet = vec3(0.65, 0.3, 1.0);
  vec3 baseColor = mix(cyan, violet, vUv.x);
  
  // Add white spike
  vec3 finalColor = mix(baseColor, vec3(1.5, 1.5, 1.5), spikeWindow * 0.8);
  
  float alpha = wave * taper * (1.0 - uLifetimeRatio * 0.7) * 0.85;
  
  gl_FragColor = vec4(finalColor, alpha);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
