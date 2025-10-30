// © 2025 Joseph MULÉ – M1SSION™ – Neurites Fragment Shader

#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 fragColor;

// Simplex noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// Flow field
vec2 flowField(vec2 p, float t) {
    float n1 = snoise(p * 0.5 + vec2(t * 0.3, 0.0));
    float n2 = snoise(p * 0.5 + vec2(0.0, t * 0.3));
    return vec2(n1, n2);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
    
    vec3 color = vec3(0.0);
    
    // Layer 1: Fast cyan filaments
    vec2 flow1 = flowField(p * 2.0, uTime * 0.8);
    float line1 = length(flow1);
    line1 = smoothstep(0.1, 0.0, line1);
    color += vec3(0.18, 0.82, 1.0) * line1 * 0.4;
    
    // Layer 2: Medium magenta filaments
    vec2 flow2 = flowField(p * 3.0 + vec2(100.0), uTime * 0.5);
    float line2 = length(flow2);
    line2 = smoothstep(0.08, 0.0, line2);
    color += vec3(1.0, 0.29, 0.82) * line2 * 0.3;
    
    // Layer 3: Slow orange sparkles
    vec2 flow3 = flowField(p * 4.0 + vec2(200.0), uTime * 0.3);
    float sparkle = length(flow3);
    sparkle = smoothstep(0.05, 0.0, sparkle);
    sparkle *= sin(uTime * 10.0 + p.x * 20.0) * 0.5 + 0.5;
    color += vec3(1.0, 0.7, 0.23) * sparkle * 0.5;
    
    fragColor = vec4(color, length(color) * 0.3);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
