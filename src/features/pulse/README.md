# THE PULSE™ — Frontend Package Documentation

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

---

## 📋 Overview

The PULSE™ è il sistema di energia collettiva di M1SSION™. Questo package fornisce tutti i componenti UI e hook necessari per integrare il Pulse nell'app, completamente ottimizzato per PWA e dispositivi mobili.

---

## 🎯 Componenti

### 1. `PulseBar`
Barra slim sempre visibile in top safe-area.

**Props:**
```typescript
interface PulseBarProps {
  onTap?: () => void; // Callback quando l'utente tappa la barra
}
```

**Utilizzo:**
```tsx
import { PulseBar } from '@/features/pulse';

<PulseBar onTap={() => console.log('Tapped!')} />
```

**Caratteristiche:**
- ✅ Slim e non invasiva
- ✅ Mostra valore corrente e progress bar
- ✅ Animazione soglia threshold
- ✅ Safe-area aware (mobile)
- ✅ Backdrop blur per leggibilità

---

### 2. `PulsePanel`
Modal/Sheet dettaglio con informazioni complete.

**Props:**
```typescript
interface PulsePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Utilizzo:**
```tsx
import { PulsePanel } from '@/features/pulse';

<PulsePanel open={isOpen} onOpenChange={setIsOpen} />
```

**Contenuti:**
- Valore globale corrente
- Spiegazione "Cos'è il Pulse"
- Log ultimi threshold raggiunti
- Micro-feed aggiornamenti
- Scroll area ottimizzata per mobile

---

### 3. `PulseLeaderboard`
Leaderboard top contributors con filtri daily/weekly.

**Utilizzo:**
```tsx
import { PulseLeaderboard } from '@/features/pulse';

<PulseLeaderboard />
```

**Caratteristiche:**
- ✅ Viste aggregate (privacy-safe)
- ✅ Filtri daily/weekly
- ✅ Icone ranking (oro/argento/bronzo)
- ✅ Scroll infinito per mobile
- ✅ Opt-in disclosure

---

### 4. `MapPulseOverlay`
Overlay canvas 2D per effetti ripple sulla mappa.

**Props:**
```typescript
interface MapPulseOverlayProps {
  enabled?: boolean;
  reduceMotion?: boolean;
}
```

**Utilizzo:**
```tsx
import { MapPulseOverlay } from '@/features/pulse';

<MapPulseOverlay enabled={true} reduceMotion={false} />
```

**Caratteristiche:**
- ✅ Canvas 2D trasparente
- ✅ Onde/ripple animate
- ✅ Threshold burst effect
- ✅ Non cattura pointer events
- ✅ Mix-blend-mode screen
- ✅ GPU-accelerated

**Safety:**
- ❌ Non modifica layers mappa
- ❌ Non intercetta gesture
- ❌ Non tocca logica markers

---

### 5. `PulseAccessibilityToggle`
Toggle per ridurre animazioni (accessibilità).

**Props:**
```typescript
interface PulseAccessibilityToggleProps {
  onToggle?: (reduced: boolean) => void;
}
```

**Utilizzo:**
```tsx
import { PulseAccessibilityToggle } from '@/features/pulse';

<PulseAccessibilityToggle onToggle={(reduced) => console.log(reduced)} />
```

**Caratteristiche:**
- ✅ Rileva `prefers-reduced-motion`
- ✅ Salva preferenza in localStorage
- ✅ Label accessibile
- ✅ Switch UI component

---

## 🪝 Hooks

### `usePulseRealtime()`

Hook principale per sottoscrivere stato Pulse in realtime.

**Return Type:**
```typescript
interface UsePulseRealtimeReturn {
  pulseState: PulseState | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdate: PulseRealtimePayload | null;
  refetch: () => Promise<void>;
}

interface PulseState {
  value: number; // 0-100
  last_threshold: number; // 0/25/50/75/100
  updated_at: string;
}

interface PulseRealtimePayload {
  value: number;
  delta: number;
  threshold: number | null;
  type?: 'decay';
}
```

**Utilizzo:**
```tsx
import { usePulseRealtime } from '@/features/pulse';

const { pulseState, isLoading, error, lastUpdate, refetch } = usePulseRealtime();

// Accesso valore corrente
const currentValue = pulseState?.value ?? 0;

// Notifica threshold
if (lastUpdate?.threshold) {
  console.log(`Soglia ${lastUpdate.threshold}% raggiunta!`);
}
```

**Caratteristiche:**
- ✅ Sottoscrizione Supabase Realtime
- ✅ Throttle updates (max 10/s)
- ✅ Auto-retry con backoff
- ✅ Cleanup automatico
- ✅ TypeScript strict

---

## 🔗 Integrazione nell'App

### Esempio completo:

```tsx
import { useState } from 'react';
import { PulseBar, PulsePanel, MapPulseOverlay } from '@/features/pulse';

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div>
      {/* Top Bar (sempre visibile) */}
      <PulseBar onTap={() => setIsPanelOpen(true)} />

      {/* Map Overlay (sopra la mappa) */}
      <MapPulseOverlay enabled={true} reduceMotion={reduceMotion} />

      {/* Detail Panel (modal on-demand) */}
      <PulsePanel open={isPanelOpen} onOpenChange={setIsPanelOpen} />

      {/* Rest of your app */}
      <main>
        {/* Content */}
      </main>
    </div>
  );
}
```

---

## 📱 Ottimizzazione PWA/Mobile

Tutti i componenti sono ottimizzati per:
- ✅ **Safe-area insets** (iOS notch)
- ✅ **Touch targets** (44x44px minimum)
- ✅ **Gesture-friendly** (scroll, swipe)
- ✅ **Performance** (throttling, debouncing)
- ✅ **Offline-first** (Realtime fallback)
- ✅ **Responsive** (breakpoints mobile-first)

---

## 🎨 Design System Integration

Componenti usano **solo semantic tokens** da `index.css`:
- `--primary` per colore principale
- `--muted` per backgrounds
- `--border` per separatori
- `--foreground` / `--background` per testo

**NO hardcoded colors** — tutto themed!

---

## ⚡ Performance

- **Canvas rendering**: GPU-accelerated con `requestAnimationFrame`
- **Realtime throttle**: Max 10 updates/s
- **Lazy loading**: Sheet content caricato solo quando aperto
- **Memory management**: Cleanup automatico su unmount
- **Bundle size**: ~12KB gzipped (tree-shakable)

---

## 🔒 Sicurezza & Privacy

- **RLS**: Accesso dati solo tramite RPC server-authoritative
- **Rate-limit**: Integrato lato backend
- **Privacy**: Leaderboard solo con opt-in
- **No PII**: Nessun dato sensibile client-side

---

## 🧪 Testing

```bash
# Unit tests
npm test -- features/pulse

# E2E tests
npm run test:e2e -- pulse
```

---

## 📦 Dependencies

- `react` ^18.3.1
- `framer-motion` ^12.10.0
- `lucide-react` ^0.462.0
- `@supabase/supabase-js` ^2.49.4
- `date-fns` ^3.6.0

**Zero external dependencies extra** oltre quelle già in M1SSION™.

---

## 🚀 Roadmap

- [ ] 3D overlay per mappa globe
- [ ] Push notifications per threshold
- [ ] Mini-game "contribuisci al Pulse"
- [ ] Analytics dashboard admin
- [ ] A/B testing UI variants

---

## 📞 Support

Per domande o problemi:
- 📧 Email: support@m1ssion.app
- 📚 Docs: https://docs.m1ssion.app/pulse
- 🐛 Issues: https://github.com/m1ssion/app/issues

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
