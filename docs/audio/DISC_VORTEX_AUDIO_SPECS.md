# DISC VORTEX Audio Specifications

## Overview
This document specifies the audio requirements for the TRON disc vortex spinning sound effect in the M1SSION™ BUZZ interface.

## Audio Requirements

### Duration
- **Total Length**: 2-4 seconds (loopable seamlessly)
- The audio should loop perfectly without audible clicks or gaps

### Sonic Character
This sound should evoke a **futuristic energy vortex** or **quantum gyroscope spinning**:

1. **Base Layer (Continuous)** - 0-4s
   - Smooth, consistent whooshing/swirling sound
   - Mid-to-high frequencies (800Hz - 4kHz dominant)
   - Similar to: spinning turbine, energy field, or wind tunnel
   - Should feel mechanical yet ethereal

2. **Harmonic Layer** - Throughout
   - Subtle harmonic resonance
   - Slight Doppler effect to simulate rotation
   - Minimal pitch variation to avoid monotony
   - Clean, not distorted

3. **Energy Texture** - Throughout
   - Light digital/synthetic shimmer
   - Suggests electromagnetic activity
   - Transparent, not overpowering

### Reference Sounds
Think of a combination of:
- Spinning hard drive platters (sped up 3x)
- Wind through a narrow gap
- Gyroscope spinning at high speed
- Energy field from sci-fi movies (TRON, Interstellar)
- **NOT**: jet engine, rocket, combustion motor

### Technical Specifications
- **Format**: MP3 (recommended) or OGG
- **Sample Rate**: 44.1kHz minimum
- **Bit Rate**: 192kbps minimum
- **Channels**: Stereo (for spatial effect) or Mono
- **Normalization**: Peak at -3dB to prevent clipping
- **Loop Points**: Must be seamless (fade in/out at boundaries if needed)

### Volume Characteristics
- Consistent volume throughout
- No sudden peaks or drops
- Should sit in background, not dominate
- Mobile-safe levels (no distortion on iPhone speakers)

### File Location
```
public/audio/disc-vortex.mp3
```

## Generation Suggestions

### AI Audio Generators
1. **ElevenLabs Sound Effects** - Use prompt: "futuristic spinning disc vortex, energy whoosh loop, TRON style, clean sustained rotation"
2. **Suno.ai** - Generate with: "seamless loop, spinning energy vortex, sci-fi disc rotation, ethereal whoosh"
3. **Loudly.com** - "spinning vortex loop, electronic whoosh, continuous rotation"

### Sound Libraries
- Freesound.org - Search: "vortex loop", "spinning disc", "energy whoosh"
- BBC Sound Effects - "whoosh", "wind tunnel", "spinner"
- Zapsplat - "sci-fi spin loop", "vortex"

### Manual Creation (DAW)
1. Layer white noise with high-pass filter (800Hz+)
2. Apply chorus/phaser for movement
3. Add light reverb
4. Automate subtle filter sweep
5. Ensure seamless loop points

## Implementation Notes

### Usage Context
- Plays continuously while BUZZ disc is visible and idle
- Does NOT play during loading/processing
- Triggered on page mount or when disc becomes visible
- Fades in smoothly (200-300ms)
- Fades out when leaving page

### Volume Control
- Default volume: 0.3 (30%)
- Should blend with ambient UI sounds
- Respects global mute settings

### Performance
- Preloaded on page initialization
- Loop attribute set in Audio element
- Minimal CPU usage (no real-time processing)

## Testing Checklist
- [ ] Sound loops seamlessly without clicks
- [ ] Volume comfortable on mobile speakers
- [ ] No distortion at max device volume
- [ ] Works on Safari iOS (PWA)
- [ ] Blends well with other UI sounds
- [ ] Doesn't overwhelm the spacecraft ignition sound
- [ ] Reinforces visual rotation without being distracting

---

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
