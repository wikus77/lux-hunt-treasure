# SPACECRAFT IGNITION AUDIO — Implementation Guide
## M1SSION™ BUZZ Sound Effect Specification

⸻

## 📍 File Location

**Required Path:** `public/audio/spacecraft-ignition.mp3`

The audio file MUST be placed in this exact location for the BUZZ button to play it correctly.

⸻

## 🎵 Audio Specifications

### Duration
- **Total Length:** 1.5 – 3.0 seconds
- **Structure:**
  - `0.0 - 0.3s` → Soft ignition (fade-in)
  - `0.3 - 1.5s` → Crescendo / power buildup
  - `1.5 - 2.2s` → Peak + brief tail (aligns with success notification)

### Sonic Character
- **Genre:** Futuristic spacecraft / sci-fi reactor
- **NOT:** Combustion engine, car motor, mechanical clanking
- **YES:** Quantum energy, plasma reactor, warp core activation
- **Timbre:**
  - Synthesized tones
  - Electronic modulations
  - Frequency sweeps
  - Energetic texture
  
### Technical Requirements
- **Format:** MP3 (recommended) or OGG
- **Sample Rate:** 44.1 kHz or 48 kHz
- **Bit Rate:** 128 kbps minimum, 192 kbps recommended
- **Channels:** Mono or Stereo
- **Normalization:** Peak at -3dB to -6dB (avoid clipping on mobile devices)
- **Size:** < 200KB (for fast PWA loading)

### Volume Profile
- **Start:** Soft (fade-in from silence or near-silence)
- **Middle:** Moderate crescendo
- **Peak:** Clear, noticeable but not overwhelming
- **End:** Brief decay (no abrupt cut)

⸻

## 🔊 Sonic Reference Ideas

Think of these iconic sci-fi sounds:
- **Star Trek:** Warp drive engaging
- **Interstellar:** Docking sequence / quantum data transmission
- **Tron Legacy:** Energy disc charging
- **Mass Effect:** Biotic power activation
- **Halo:** Energy shield recharge

Mix elements like:
- Low sub-bass hum (foundation)
- Mid-frequency sweep (movement/energy)
- High-frequency sparkle/glitter (detail)
- Modulation/tremolo (alive/pulsing quality)

⸻

## 🛠️ Where to Find/Create the Audio

### Option A: Use AI Audio Generators
1. **ElevenLabs Sound Effects** (https://elevenlabs.io/sound-effects)
   - Prompt: "Futuristic spacecraft ignition with crescendo, quantum energy reactor startup, 2 seconds"
   
2. **AudioCraft / MusicGen** (Meta AI)
   - Open source, can generate custom sound effects
   
3. **Suno / Stable Audio**
   - AI-generated sound effects with prompts

### Option B: Use Royalty-Free Libraries
1. **Freesound.org**
   - Search: "sci-fi ignition", "energy charge", "plasma startup"
   - Filter by Creative Commons license
   
2. **ZapSplat** (https://www.zapsplat.com)
   - Category: Sci-Fi > Energy / Power
   
3. **BBC Sound Effects** (Free for personal/research use)
   - Search: spacecraft, energy, reactor

### Option C: Create Your Own
1. Use DAW software (Ableton, FL Studio, Logic Pro)
2. Synthesizers to try:
   - **Serum / Vital** (wavetable synths)
   - **Omnisphere** (cinematic sounds)
   - **Analog Lab** (modular patches)
3. Layering approach:
   - Layer 1: Sub bass (sine wave, gentle attack)
   - Layer 2: Mid sweep (filter automation, pitch rise)
   - Layer 3: High sparkle (white noise + high-pass filter)
   - Layer 4: Modulation (LFO on volume/filter)

⸻

## 🔧 Integration Status

### ✅ Code Integration Complete
- `useSoundEffects.ts` → Added `spacecraftIgnition` sound type
- `BuzzActionButton.tsx` → Calls `playSound('spacecraftIgnition', 0.6)` on click
- Audio preloading enabled for smooth playback
- Safari iOS PWA compatible (gesture-triggered playback)

### ⚠️ Missing Component
**YOU MUST PROVIDE:** The actual audio file at `public/audio/spacecraft-ignition.mp3`

Once you place the file in that location:
1. The BUZZ button will automatically play it on every click
2. Volume is set to 60% (adjustable in code if needed)
3. Audio respects device volume and mute settings
4. No autoplay restrictions (triggered by user gesture)

⸻

## 🎯 User Experience Flow

1. **User taps BUZZ button**
   → Spacecraft ignition sound starts immediately (fade-in)
   
2. **During BUZZ processing (Stripe payment, loading)**
   → Sound continues its crescendo, LED ring animates
   
3. **Success notification appears**
   → Sound reaches peak, then brief tail decay
   
4. **Complete**
   → Sound ends naturally, shockwave animation plays

⸻

## 📱 Testing Checklist

Once you add the audio file, verify:

- ✅ Sound plays on first BUZZ click (Safari iOS PWA)
- ✅ Sound doesn't overlap if user spam-clicks (handled by audio reset)
- ✅ Volume is appropriate (not too loud, not too quiet)
- ✅ No clipping or distortion on iPhone speaker
- ✅ Crescendo timing feels natural with button animation
- ✅ No console errors related to audio loading
- ✅ PWA caches the audio for offline use

⸻

## 🔒 Safety Compliance

This implementation respects all project safety clauses:
- ✅ No changes to BUZZ logic (Stripe, M1U, PE, counters)
- ✅ No changes to Buzz Map, geolocation, markers
- ✅ No changes to push notifications, fetch-interceptor
- ✅ No changes to UnifiedHeader, BottomNavigation
- ✅ No hard-coded URLs or keys
- ✅ 100% PWA mobile optimized
- ✅ Fully exportable code (no proprietary dependencies)

⸻

## 📝 Quick Setup Steps

1. **Get your audio file** (2-3 second spacecraft ignition sound)
2. **Name it:** `spacecraft-ignition.mp3`
3. **Place it in:** `public/audio/` folder
4. **Test:** Click the BUZZ button on `/buzz` route
5. **Enjoy:** Futuristic audio feedback on every BUZZ! 🚀

⸻

**Need help?** If the sound doesn't play:
1. Check browser console for 404 errors
2. Verify file path is exactly `public/audio/spacecraft-ignition.mp3`
3. Check file format is MP3 (not WAV, FLAC, etc.)
4. Ensure file size is reasonable (< 200KB)
5. Test on desktop first, then Safari iOS

⸻

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
