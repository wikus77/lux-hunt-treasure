# 🎯 Pulse Energy + Rank System — Frontend Integration Guide

**M1SSION™ — 100% Custom Implementation**  
**© 2025 Joseph MULÉ – ALL RIGHTS RESERVED – NIYVORA KFT™**

---

## 📋 Overview

Questo documento descrive l'implementazione frontend del sistema **Pulse Energy (PE)** e **Gerarchia Agenti v2.0**, mantenendo piena retrocompatibilità con il sistema XP legacy.

---

## 🔧 Componenti Implementati

### 1. Hook: `usePulseEnergy`
**Path:** `src/hooks/usePulseEnergy.ts`

**Responsabilità:**
- Wrapper di `useXpSystem()` per retrocompatibilità
- Fetch catalogo `agent_ranks` da Supabase (sola lettura)
- Calcolo grado corrente basato su PE
- Calcolo grado successivo e progresso (0-100%)
- Bridge terminologico: `total_xp` → `pulseEnergy`

**Exports:**
```typescript
interface UsePulseEnergyReturn {
  pulseEnergy: number;              // Bridge: alias di xpStatus.total_xp
  currentRank: AgentRank | null;    // Grado attuale
  nextRank: AgentRank | null;       // Prossimo grado (null se max)
  progressToNextRank: number;       // 0-100%
  buzzCredits: number;
  buzzMapCredits: number;
  loading: boolean;
  hasNewRewards: boolean;
  consumeCredit: (type) => Promise<boolean>;
  refreshPulseEnergy: () => void;
  markRewardsAsSeen: () => void;
  ranksAvailable: boolean;          // True se catalogo caricato
}
```

**Usage:**
```tsx
import { usePulseEnergy } from '@/hooks/usePulseEnergy';

const MyComponent = () => {
  const { 
    pulseEnergy, 
    currentRank, 
    nextRank, 
    progressToNextRank,
    loading 
  } = usePulseEnergy();

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <p>PE Totale: {pulseEnergy}</p>
      <p>Grado: {currentRank?.name_it}</p>
      <p>Progresso: {progressToNextRank.toFixed(1)}%</p>
    </div>
  );
};
```

---

### 2. Component: `PulseEnergyBadge`
**Path:** `src/components/pulse/PulseEnergyBadge.tsx`

**Props:**
```typescript
interface PulseEnergyBadgeProps {
  rank: AgentRank | null;
  className?: string;
  showCode?: boolean;  // Mostra codice grado (es. AG-01)
}
```

**Features:**
- Badge colorato con bordo e glow dinamico (colore del grado)
- Simbolo emoji + nome grado in italiano
- Codice grado opzionale (font mono)
- Fallback graceful se rank è null

**Usage:**
```tsx
<PulseEnergyBadge rank={currentRank} showCode={true} />
```

---

### 3. Component: `PulseEnergyProgressBar`
**Path:** `src/components/pulse/PulseEnergyProgressBar.tsx`

**Props:**
```typescript
interface PulseEnergyProgressBarProps {
  currentRank: AgentRank | null;
  nextRank: AgentRank | null;
  progressPercent: number;  // 0-100
  currentPE: number;
  className?: string;
}
```

**Features:**
- Progress bar con valore 0-100%
- Label: PE corrente vs PE necessario per prossimo grado
- Special state: "GRADO MASSIMO RAGGIUNTO" se nextRank è null
- Styling M1SSION (cyan gradient)

**Usage:**
```tsx
<PulseEnergyProgressBar
  currentRank={currentRank}
  nextRank={nextRank}
  progressPercent={progressToNextRank}
  currentPE={pulseEnergy}
/>
```

---

### 4. Component: `RankUpModal`
**Path:** `src/components/pulse/RankUpModal.tsx`

**Props:**
```typescript
interface RankUpModalProps {
  open: boolean;
  onClose: () => void;
  newRank: AgentRank;
}
```

**Features:**
- Modal celebrativo con confetti automatico
- Badge grado grande con colore dinamico
- Nome, codice e descrizione del nuovo grado
- Auto-dismiss dopo interazione utente

**Logic:**
```tsx
// In parent component (es. Profile)
const [showRankUp, setShowRankUp] = useState(false);
const [newRank, setNewRank] = useState<AgentRank | null>(null);

useEffect(() => {
  const lastRankCode = localStorage.getItem('__m1_last_rank_code');
  
  if (currentRank && currentRank.code !== lastRankCode) {
    setNewRank(currentRank);
    setShowRankUp(true);
    localStorage.setItem('__m1_last_rank_code', currentRank.code);
  }
}, [currentRank]);

return (
  <RankUpModal
    open={showRankUp}
    onClose={() => setShowRankUp(false)}
    newRank={newRank!}
  />
);
```

---

## 🎨 Integrazione UI nel Profilo Agente

### Slot di montaggio (ProfileInfo.tsx)

**Posizione:** Dopo "Stile investigativo", prima di "Quick Stats"

```tsx
// Aggiungi dopo il blocco "Investigative Style" (linea ~184)

{/* Pulse Energy & Rank */}
<div className="mb-4 space-y-3">
  <div className="flex justify-center">
    <PulseEnergyBadge rank={currentRank} showCode={true} />
  </div>
  
  <PulseEnergyProgressBar
    currentRank={currentRank}
    nextRank={nextRank}
    progressPercent={progressToNextRank}
    currentPE={pulseEnergy}
  />
</div>
```

**Imports necessari:**
```tsx
import { usePulseEnergy } from '@/hooks/usePulseEnergy';
import PulseEnergyBadge from '@/components/pulse/PulseEnergyBadge';
import PulseEnergyProgressBar from '@/components/pulse/PulseEnergyProgressBar';
```

---

## 🔄 Sostituzioni Terminologiche (UI Only)

**Non rinominare funzioni/variabili legacy!** Solo label UI:

| Vecchia Label | Nuova Label |
|---------------|-------------|
| "XP Totale" | "PE Totale" / "Pulse Energy" |
| "Livello & XP" | "Grado & PE" |
| "XP al prossimo livello" | "PE al prossimo grado" |

**Esempio (ProfileTabs.tsx):**
```tsx
// Linea ~113: sostituisci label
<span className="text-xs text-gray-400">PE totali: </span>
<span className="text-base font-medium">{stats.pointsEarned.toLocaleString('it-IT')}</span>
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] `usePulseEnergy` calcola correttamente `currentRank` per vari valori PE
- [ ] Progress bar mostra 0% a soglia minima e 100% a soglia massima
- [ ] Badge fallback funziona con `rank=null`

### Integration Tests
- [ ] Cambio PE → rank aggiornato in tempo reale
- [ ] RankUpModal appare solo UNA volta per rank-up
- [ ] `localStorage.__m1_last_rank_code` aggiornato correttamente

### Visual Tests
- [ ] Badge colori coerenti con `agent_ranks.color`
- [ ] Progress bar responsive su mobile/desktop
- [ ] Confetti non bloccano UI

### Regression Tests
- [ ] `useXpSystem()` ancora funzionante in componenti legacy
- [ ] Buzz/Map credits consumabili senza errori
- [ ] Nessun errore console se `agent_ranks` vuoto (fallback graceful)

---

## 🚨 SAFETY COMPLIANCE

### ✅ Non Toccati
- Buzz/Buzz Map logic (solo PE award addizionale)
- Geolocalizzazione
- Admin Pulse Lab
- Push notifications chain
- Norah AI 2.0
- Stripe payments
- Map markers
- UnifiedHeader/BottomNavigation struttura

### ✅ Retrocompatibilità
- `useXpSystem()` mantenuto funzionante
- Variabili interne: `xpStatus`, `total_xp` immutati
- Solo wrapper addizionale (`usePulseEnergy`)

---

## 📦 Files Summary

**New Files (4):**
```
src/
  hooks/
    usePulseEnergy.ts              ← Hook principale
  components/
    pulse/
      PulseEnergyBadge.tsx         ← Badge grado
      PulseEnergyProgressBar.tsx   ← Progress bar PE
      RankUpModal.tsx              ← Modal rank-up
```

**Modified Files (1):**
```
src/
  components/
    profile/
      ProfileInfo.tsx              ← Integrazione slot PE/Rank
```

**Docs (1):**
```
docs/
  PULSE-INTEGRATION-FRONTEND.md   ← Questo file
```

---

## 🔗 Riferimenti Backend

Per l'implementazione database (tabelle `agent_ranks`, funzioni `award_pulse_energy`, trigger), vedi:
- `docs/PULSE-INTEGRATION-BACKEND.md`
- `supabase/migrations/20251031_*.sql`

---

**Status:** ✅ Ready for Production  
**Version:** 1.0.0  
**Last Updated:** 2025-10-31

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
