// © 2025 Joseph MULÉ – M1SSION™ – Tunnel Vertex Shader

#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aBary;

uniform mat4 uProjection;
uniform mat4 uView;
uniform float uTime;
uniform float uSeed;

out vec3 vPos;
out vec3 vBary;
out float vRing;
out float vTheta;

// fBm noise for organic deformation
float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 57.0 + i.z * 113.0;
    return mix(
        mix(mix(hash(n), hash(n + 1.0), f.x),
            mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
        mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
            mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z
    );
}

float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p *= 2.01;
    f += 0.2500 * noise(p); p *= 2.02;
    f += 0.1250 * noise(p);
    return f;
}

void main() {
    // Cylindrical tunnel generation
    float ring = aPosition.z;
    float theta = aPosition.x * 6.28318530718; // 2*PI
    
    // Organic radius modulation
    float noiseVal = fbm(vec3(theta * 0.5, ring * 0.3 + uTime * 0.1, uSeed));
    float radius = 1.5 + noiseVal * 0.4;
    
    // Skew for neuron-like deformation
    float skew = sin(ring * 2.0 + uTime * 0.5) * 0.15;
    theta += skew;
    
    // Calculate position
    vec3 pos;
    pos.x = cos(theta) * radius;
    pos.y = sin(theta) * radius;
    pos.z = -ring * 8.0;
    
    // Output
    vPos = pos;
    vBary = aBary;
    vRing = ring;
    vTheta = theta;
    
    gl_Position = uProjection * uView * vec4(pos, 1.0);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
