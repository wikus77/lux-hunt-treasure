// © 2025 Joseph MULÉ – M1SSION™ – Tunnel Fragment Shader

#version 300 es
precision highp float;

in vec3 vPos;
in vec3 vBary;
in float vRing;
in float vTheta;

uniform float uTime;
uniform float uSeed;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 fragBloom;

// Noise for hotspots
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec4 p) {
    vec4 i = floor(p);
    vec4 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 57.0 + i.z * 113.0 + i.w * 197.0;
    return fract(sin(n) * 43758.5453);
}

// Wireframe calculation
float edgeFactor() {
    vec3 d = fwidth(vBary);
    vec3 a3 = smoothstep(vec3(0.0), d * 1.5, vBary);
    return min(min(a3.x, a3.y), a3.z);
}

void main() {
    // Wireframe edges
    float edge = 1.0 - edgeFactor();
    
    // Color gradient cyan -> magenta
    float colorMix = sin(vTheta * 2.0 + uTime * 0.5) * 0.5 + 0.5;
    vec3 cyanColor = vec3(0.18, 0.82, 1.0);      // #2fc5ff
    vec3 magentaColor = vec3(1.0, 0.29, 0.82);   // #ff4bd1
    vec3 wireColor = mix(cyanColor, magentaColor, colorMix);
    
    // Hotspots (synapses) that travel along tunnel
    float hotspot = noise(vec4(vPos * 0.3, (vPos.z + uTime * 2.0) * 0.5));
    hotspot = pow(hotspot, 8.0);
    
    // Gold/orange for hotspots
    vec3 hotColor = vec3(1.0, 0.7, 0.23); // #ffb23a
    
    // Combine
    vec3 finalColor = wireColor * edge * 0.8;
    finalColor += hotColor * hotspot * 2.0;
    
    // Electric blue modulation
    float electricPulse = sin(vRing * 10.0 - uTime * 4.0) * 0.5 + 0.5;
    finalColor += vec3(0.16, 0.32, 1.0) * electricPulse * edge * 0.3;
    
    // Output
    fragColor = vec4(finalColor, edge * 0.9 + hotspot);
    
    // Bloom pass (only bright areas)
    float brightness = max(max(finalColor.r, finalColor.g), finalColor.b);
    if (brightness > 0.6) {
        fragBloom = vec4(finalColor * (brightness - 0.6) * 2.0, 1.0);
    } else {
        fragBloom = vec4(0.0);
    }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
