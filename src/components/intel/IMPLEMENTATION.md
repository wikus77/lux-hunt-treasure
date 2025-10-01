# M1SSION AI Analyst - Siri-Style Orb UI Implementation

© 2025 Joseph MULÉ – M1SSION™

## Overview

Full-screen Siri-inspired AI Analyst interface for M1SSION Intelligence page, featuring a reactive orb, edge glow effects, and human-like conversational AI.

## Architecture

### Components Structure

```
src/components/intel/
├── ui/
│   ├── AiOrbStage.tsx          # Full-screen stage container
│   ├── AiOrbButton.tsx         # Central orb with animations
│   ├── EdgeGlowCanvas.tsx      # Reactive perimeter glow (canvas)
│   └── AiDock.tsx              # Bottom command bar
├── ai-analyst/
│   ├── AIAnalystPanel.tsx      # Chat panel overlay
│   ├── IntelStage.tsx          # Legacy stage (kept for compatibility)
│   ├── IntelOrb.tsx            # Legacy orb component
│   ├── IntelDock.tsx           # Legacy dock component
│   └── FinalShotQuickAccess.tsx # Final Shot card shortcut
├── hooks/
│   ├── useMicLevel.ts          # Microphone audio level hook
│   └── useTTS.ts               # Text-to-Speech hook
└── IMPLEMENTATION.md           # This file
```

### Key Features

1. **Siri-Like Orb Interface**
   - Large central orb (240-320px) with M1SSION gradient (magenta → pink → cyan)
   - Four states: `idle`, `listening`, `thinking`, `speaking`
   - GPU-accelerated animations (CSS transforms + filters)
   - Reactive to audio level (scales with microphone input)

2. **Edge Glow Canvas**
   - Full-screen perimeter glow using HTML5 Canvas
   - Reactive to microphone audio level (RMS calculation)
   - Smooth "breathing" animation in idle state
   - Intensifies during `listening` and `speaking` states

3. **AI Response System**
   - 250 pre-defined templates across 5 modes:
     - `classify` (50 templates): Organize and categorize clues
     - `patterns` (50 templates): Find connections and correlations
     - `decode` (50 templates): Decode ciphers and patterns
     - `probability` (50 templates): Assess chances and risks
     - `mentor` (50 templates): Motivational guidance
   - Seed-based selection for variety (no repetition in same session)
   - Intent router for special queries:
     - "Parlami di M1SSION" → 3 variant explanations
     - Probability questions → Quantitative assessment
     - Spoiler attempts → Guard rails redirect

4. **Audio Integration**
   - Microphone capture with WebAudio API
   - Real-time audio level analysis (AnalyserNode, FFT 1024)
   - RMS calculation for accurate level detection
   - Cleanup on unmount (tracks, context, animation frames)
   - Optional Text-to-Speech (HTML5 speechSynthesis)

5. **Feature Flag System**
   - URL parameter: `?intel_ai=0` disables new UI (shows legacy)
   - Default: New UI enabled
   - No localStorage persistence (URL-only control)
   - Legacy components preserved (not removed)

## Usage

### Page Integration

```tsx
import AiOrbStage from '@/components/intel/ui/AiOrbStage';
import AIAnalystPanel from '@/components/intel/ai-analyst/AIAnalystPanel';
import { useIntelAnalyst } from '@/hooks/useIntelAnalyst';
import { useMicLevel } from '@/components/intel/hooks/useMicLevel';

const IntelligencePage = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const { messages, isProcessing, status, sendMessage, ... } = useIntelAnalyst();
  const { level: micLevel } = useMicLevel(panelOpen && ttsEnabled);

  return (
    <>
      {!panelOpen && (
        <AiOrbStage
          status={status}
          audioLevel={micLevel}
          onOrbClick={() => setPanelOpen(true)}
          micEnabled={ttsEnabled}
          onMicToggle={toggleTTS}
        />
      )}
      
      <AIAnalystPanel 
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        messages={messages}
        isProcessing={isProcessing}
        onSendMessage={sendMessage}
        currentMode={currentMode}
        status={status}
        audioLevel={micLevel}
        ttsEnabled={ttsEnabled}
        onToggleTTS={toggleTTS}
      />
    </>
  );
};
```

### Props Compatibility

`AIAnalystPanel` accepts both `open` and `isOpen` for backward compatibility:

```tsx
<AIAnalystPanel isOpen={true} />  // ✅ Works
<AIAnalystPanel open={true} />    // ✅ Also works
```

## AI Response Engine

### Template Selection

```typescript
// Seed-based selection prevents repetition
const seed = hashSeed(userId + timestamp);
const template = ANALYST_TEMPLATES[mode][seed % templates.length];
```

### Intent Routing

```typescript
// Special intents
if (text.includes('parlami di m1ssion')) {
  return MISSION_INFO[seed % 3]; // 3 variants
}

if (text.includes('probabilità')) {
  return probabilityAssessment(clues, seed);
}

// Spoiler guard
if (checkSpoilerRequest(text)) {
  return redirectToStrategy(seed);
}

// Mode-based response
return ANALYST_TEMPLATES[mode][seed % templates.length];
```

### Humanization

Responses are enhanced with:
- Hedges: "Direi che...", "Mi sembra...", "Forse..."
- Transitions: "Tuttavia...", "In ogni caso...", "Comunque..."
- Closings: "Avanti così.", "Buona caccia.", "Ci rivedremo."

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus-visible outlines (cyan glow)
- Screen reader friendly (aria-pressed, aria-label)

## Performance

- CSS animations use `transform` and `opacity` (GPU accelerated)
- Canvas drawing optimized with `requestAnimationFrame`
- Audio context properly cleaned up on unmount
- No memory leaks (tracks stopped, contexts closed)

## Browser Support

- Modern browsers with WebAudio API
- Fallback for browsers without `speechSynthesis`
- Canvas 2D context required for EdgeGlow
- getUserMedia required for microphone features

## Future Enhancements

- [ ] Voice input (Speech Recognition API)
- [ ] Multi-language support (currently Italian only)
- [ ] Video call simulation (camera integration)
- [ ] Persistent conversation history (Supabase)
- [ ] AI-generated clue suggestions

## Testing

Manual testing checklist:
- [ ] Desktop: Orb loads, animations smooth
- [ ] Mobile: Responsive, touch events work
- [ ] iOS Safari: Mic permission, audio level reactive
- [ ] Mic disabled: Edge glow still works (idle breathing)
- [ ] 10 consecutive messages: No repeated responses
- [ ] "Parlami di M1SSION": Returns one of 3 variants
- [ ] Spoiler attempt: Guard rail activates
- [ ] Feature flag `?intel_ai=0`: Legacy UI loads

## License

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
