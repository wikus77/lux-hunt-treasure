# Mind Fractal - Wireframe Tunnel DNA Puzzle

## Overview
The Mind Fractal is an advanced WebGL2-based neural tunnel visualization and puzzle game for the M1SSION DNA system. It features:

- **Vanilla WebGL2 rendering** (no Three.js dependency)
- **Custom GLSL shaders** for organic wireframe tunnel, neurites, and bloom effects
- **WebAudio API** for reactive spatial audio
- **Supabase persistence** for game sessions and progression
- **iOS-first performance** with 60 FPS target

## Architecture

### Components
- `MindFractalScene.tsx` - Main React component and canvas orchestrator
- `canvas/renderer.ts` - WebGL2 initialization and rendering pipeline
- `canvas/starfield.ts` - Procedural starfield generation
- `logic/useMindFractalGame.ts` - Game state and interaction logic
- `logic/scoring.ts` - Score calculation
- `logic/settings.ts` - Performance and accessibility settings
- `audio/AudioEngine.ts` - WebAudio synthesis and effects
- `supabase/client.ts` - Database persistence layer

### Shaders (GLSL)
- `glsl/tunnel.vert.glsl` - Cylindrical mesh generation with organic deformation
- `glsl/tunnel.frag.glsl` - Wireframe rendering with hotspot pulses
- `glsl/neurites.frag.glsl` - Layered filament effects
- `glsl/post_bloom.frag.glsl` - Bloom post-processing with ACES tonemapping

## Visual Specifications

### Colors (exact match to reference)
- **Neuronal cores**: `#ffb23a` (gold/orange)
- **Filaments cold**: `#2fc5ff` (cyan), `#2a51ff` (blue)
- **Filaments hot**: `#ff4bd1` (magenta), `#8f6bff` (violet), `#ff77b4` (pink)
- **Background**: `#0b1021` (deep space blue/black)

### Performance Targets
- **Desktop**: ≥ 55 FPS
- **iPhone 14/15**: ≥ 28 FPS with adaptive quality
- **Fallback**: Stars-only mode for non-WebGL2 devices

## Gameplay

### Objective
"Stabilizza il flusso sinaptico" - Stabilize the synaptic flow

### Mechanics
1. **Orbit**: Drag to rotate camera around tunnel
2. **Zoom**: Pinch gesture (mobile) / scroll (desktop)
3. **Pulse**: Tap to emit a pulse wave that travels down the tunnel
4. **Connection**: If pulse aligns with 3+ consecutive hotspots, create a stable connection
5. **Win Condition**: Achieve 6 stable connections

### Scoring
```
score = base(600) - time_penalty(2pts/sec) - moves_penalty(5pts/move) + style_bonus
```

## Integration

### DNAHub.tsx
The Mind Fractal is integrated via feature flag:
```tsx
const enableMindFractal = true;
{enableMindFractal && <MindFractalScene />}
```

### Database Schema
Table: `dna_mind_fractal_sessions`
- Tracks user progress per seed
- RLS enabled with user-scoped policies
- RPC function: `upsert_dna_mind_fractal_session`

## Audio Design

### Synthesis
- **Ambient**: Detuned oscillators + chorus + reverb (IR convolution)
- **Pulse**: Noise burst with bandpass sweep
- **Connection**: Triangle wave chord (400Hz → 600Hz)
- **Victory**: C-E-G major triad with long reverb tail

### Processing
- Sidechain ducking on pulse events
- Soft-clip limiter on master bus
- iOS-safe audio context initialization

## Accessibility

### Reduce Animations Mode
When enabled:
- Halves geometry density (120 rings, 90 segments)
- Disables bloom and noise effects
- Reduces audio volume to -12dB
- Maintains 60 FPS on lower-end devices

## Development

### Testing
```bash
pnpm dev
# Navigate to /dna
# Toggle "Riduci animazioni" to test performance mode
```

### Debugging WebGL
```typescript
// Enable WebGL errors in browser console
const gl = canvas.getContext('webgl2', { 
  debug: true,
  antialias: true 
});
```

## Security Notes

- RLS policies ensure users can only access their own session data
- All database functions use `SECURITY DEFINER` with `auth.uid()` checks
- No sensitive data exposed in client-side state

## Future Enhancements

- [ ] HDR environment mapping (space_hdr.hdr)
- [ ] Physics-based hotspot timing (beat detection)
- [ ] Multiplayer competitive mode
- [ ] Advanced audio: granular synthesis, FFT reactivity
- [ ] VR/AR mode for immersive tunnel navigation

---

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
