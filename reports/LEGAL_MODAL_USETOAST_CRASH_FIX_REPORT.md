# Incident Report — Crash modale Legal (iOS WKWebView) — useToast

**Data:** 2026-02-26  
**Target:** App iOS Capacitor WKWebView  
**Sintomo:** Aprendo Legal → ErrorBoundary “Oops! Qualcosa è andato storto” — log: `Can't find variable: useToast`

---

## 1) Root cause

| Campo | Valore |
|-------|--------|
| **File** | `src/components/settings/sections/LegalSectionContent.tsx` |
| **Riga** | 33 |
| **Causa** | Il componente chiama `useToast()` con `const { toast } = useToast();` ma **non importa** `useToast`. In WKWebView il bundle esegue il modulo e alla prima valutazione di `useToast` la variabile non è in scope → `ReferenceError: Can't find variable: useToast`. |

**Flusso che porta al crash:**  
Settings (modale) → sezione “Legal” → `SettingsContent` monta `LegalSectionContent` (lazy) → al primo render viene eseguita la riga 33 → crash.

**Forensics useToast nel repo:**  
- Tutti gli altri file che usano `useToast` hanno `import { useToast } from '@/hooks/use-toast';`.  
- Solo `LegalSectionContent.tsx` usava `useToast()` **senza** alcun import (probabile rimozione accidentale in un refactor precedente, es. allineamento modale Delete Account).

---

## 2) Patch minimale

**File toccato:** `src/components/settings/sections/LegalSectionContent.tsx`

**Diff:**

```diff
 import { useAuth } from '@/hooks/use-auth';
+import { useToast } from '@/hooks/use-toast';
 import { SettingsSectionFlipOverlay } from '../SettingsSectionFlipOverlay';
```

- Nessun’altra modifica: nessuna nuova dipendenza, nessun cambio di logica, nessun altro file toccato.

---

## 3) Rollback (comando pronto)

- **Commit safety:** `25965e80fd213c0a9d961502baf28b43eedfb8c0`  
- **Tag:** `safety/legal-useToast-fix-20260226_170840`

Per annullare il fix e tornare allo stato “pre-fix Legal useToast”:

```bash
git reset --hard safety/legal-useToast-fix-20260226_170840
```

Poi, se serve app aggiornata su iOS: `npm run build` e `npx cap sync ios`.

---

## 4) Test iOS (FASE 4 — da eseguire su dispositivo)

| # | Verifica | Esito |
|---|----------|--------|
| 1 | Apri Settings | DA ESEGUIRE |
| 2 | Apri Legal | DA ESEGUIRE |
| 3 | Naviga avanti/indietro 3 volte (Legal ↔ Settings) | DA ESEGUIRE |
| 4 | Nessun crash, nessun ErrorBoundary, modale si chiude correttamente | DA ESEGUIRE |

**Esito:** PASS / FAIL (da compilare dopo test su iPhone).

---

FINE REPORT
