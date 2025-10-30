// © 2025 Joseph MULÉ – M1SSION™ – Bloom Post-Process Shader

#version 300 es
precision highp float;

uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec2 uResolution;
uniform float uBloomIntensity;
uniform int uPass; // 0=threshold, 1=blur_h, 2=blur_v, 3=composite

in vec2 vUv;
out vec4 fragColor;

// Gaussian blur weights
const float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

vec4 blur(sampler2D tex, vec2 uv, vec2 direction) {
    vec4 result = texture(tex, uv) * weights[0];
    for(int i = 1; i < 5; i++) {
        vec2 offset = direction * float(i) / uResolution;
        result += texture(tex, uv + offset) * weights[i];
        result += texture(tex, uv - offset) * weights[i];
    }
    return result;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    
    if (uPass == 0) {
        // THRESHOLD: Extract bright areas from scene
        vec4 sceneColor = texture(uScene, uv);
        float brightness = max(max(sceneColor.r, sceneColor.g), sceneColor.b);
        if (brightness > 0.5) {
            fragColor = vec4(sceneColor.rgb * (brightness - 0.5) * 2.0, 1.0);
        } else {
            fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    } else if (uPass == 1) {
        // BLUR HORIZONTAL
        fragColor = blur(uBloom, uv, vec2(1.0, 0.0));
    } else if (uPass == 2) {
        // BLUR VERTICAL
        fragColor = blur(uBloom, uv, vec2(0.0, 1.0));
    } else {
        // COMPOSITE: scene + bloom
        vec4 sceneColor = texture(uScene, uv);
        vec4 bloomColor = texture(uBloom, uv);
        
        // Additive blend with intensity
        vec3 result = sceneColor.rgb + bloomColor.rgb * uBloomIntensity;
        
        // ACES tonemapping
        const float a = 2.51;
        const float b = 0.03;
        const float c = 2.43;
        const float d = 0.59;
        const float e = 0.14;
        result = clamp((result * (a * result + b)) / (result * (c * result + d) + e), 0.0, 1.0);
        
        // Gamma correction
        result = pow(result, vec3(1.0 / 2.2));
        
        fragColor = vec4(result, 1.0);
    }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
