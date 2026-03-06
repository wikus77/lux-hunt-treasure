# M1U Global Slot Engine — iOS crash post-IAP — Forensics report (READ-ONLY)

**Data:** 2026-03-05  
**Scope:** Verifica forense read-only. Nessuna patch applicata.  
**Vincoli:** NO modifiche a StoreKit / IAP / receipt / purchase flow / accredito Supabase. NO modifiche a BUZZ, login/logout, delete-account, push, subscriptions.

---

## 1. Errore esatto e stacktrace

*(Da compilare con i log Xcode / Safari Develop Console quando disponibili.)*

- **Messaggio atteso (da codice):**  
  `useUnifiedAuth deve essere usato all'interno di un AuthProvider`
- **Stack:** *(incollare qui lo stack da Xcode Console o Safari > Develop > [iPhone] > Console)*
- **Component stack React (se presente):**  
  *(cercare in console: "The above error occurred in the ... component")*

**Placeholder per incollaggio utente:**
```
[INCOLLA QUI: ultimi 300–500 righe di log pre-crash + eventuale "Unhandled JS Exception" / "Fatal error" / stack]
```

---

## 2. File e riga più probabile

| Candidato | File | Riga / funzione | Motivazione |
|-----------|------|------------------|-------------|
| **#1 (root cause)** | `src/hooks/useUnifiedAuth.ts` | **27** — `throw new Error('useUnifiedAuth deve essere usato all\'interno di un AuthProvider')` | `GlobalM1UCreditOverlay` è montato **fuori** da `AuthProvider`. Quando `visible === true` viene renderizzato `M1UPill`, che chiama `useUnifiedAuth()`: il contesto è `undefined` → throw. |
| #2 | `src/hooks/useM1UnitsRealtime.ts` | 117, 166 — `throw new Error(...)` / `throw updateError` | Possibile solo se refetch/update falliscono; meno probabile come primo crash subito dopo IAP. |
| #3 | `src/features/m1u/M1UPill.tsx` | 520 — `displayedBalance.toLocaleString('it-IT')` | Solo se `displayedBalance` fosse `undefined`/`null`; lo state è inizializzato a numero, quindi improbabile. |

---

## 3. Timeline eventi (IAP success → overlay → crash)

Ricostruzione da codice (flusso tipico):

| T | Evento |
|---|--------|
| **T0** | IAP completa con successo; `M1UShopContent.handlePaymentSuccess()` eseguito. |
| **T0** | `emitM1UCreditEvent(amount, 'shop')` → imposta `window.__m1u_pending_credit__` e dispatch `m1u-credit-event`. |
| **T0** | `GlobalM1UCreditOverlay` (listener) riceve l’evento → `setVisible(true)`, `setAmount(detail.amount)`, schedule timeout 120 ms (dispatch) e 2800 ms (hide). |
| **T0 + 1 render** | React ri-renderizza; `visible === true` → viene montato `<M1UPill showLabel showPlusButton />` **dentro** `GlobalM1UCreditOverlay`. |
| **T0 + 1 render** | **Crash:** `M1UPill` chiama `useUnifiedAuth()`. `GlobalM1UCreditOverlay` è in un antenato che **non** include `AuthProvider` → `AuthContext` è `undefined` → `useUnifiedAuth` lancia. |
| **T0 + 1 render** | `ErrorBoundary` in `App.tsx` cattura l’errore → mostra fallback "ERRORE CRITICO DI SISTEMA" + bottone "RIAVVIA EMERGENZA". |
| T0 + 400 ms | Shop chiude (`setTimeout(() => onClose(), SHOP_CLOSE_AFTER_CREDIT_MS)`); overlay sarebbe già in stato di crash/fallback. |
| T0 + 120 ms | Timeout overlay (dispatch `m1u-credited` / `m1u-balance-changed`) potrebbe ancora eseguirsi; cleanup dell’overlay alla unmount annulla i timer. |

Quindi il crash avviene **subito al primo render** in cui l’overlay mostra la pill (T0 + 1 render), **non** ai timeout successivi.

---

## 4. Root cause candidate #1 (con prove)

**Ipotesi:** Crash dovuto a **useUnifiedAuth() usato fuori da AuthProvider**.

**Prove da codice:**

1. **Posizione di `GlobalM1UCreditOverlay` in `App.tsx` (righe 254–261):**
   - `GlobalM1UCreditOverlay` è figlio di `HelmetProvider`, **fratello** di `Router`.
   - `AuthProvider` è **dentro** `Router` > `SoundProvider` (riga 262–263).
   - Quindi **nessun antenato** di `GlobalM1UCreditOverlay` è `AuthProvider`.

2. **Quando l’overlay mostra la pill (`GlobalM1UCreditOverlay.tsx`, righe 62–78):**
   - Con `visible === true` viene renderizzato `<M1UPill showLabel showPlusButton />`.

3. **M1UPill usa sempre auth (`M1UPill.tsx`, righe 58–59):**
   - `const { user } = useUnifiedAuth();`
   - `const userId = user?.id;`

4. **useUnifiedAuth lancia se il contesto non c’è (`useUnifiedAuth.ts`, righe 24–27):**
   - `if (context === undefined) { throw new Error('useUnifiedAuth deve essere usato all\'interno di un AuthProvider'); }`

**Conclusione:** Al primo render della pill nell’overlay, il contesto auth è `undefined` → throw → ErrorBoundary → schermata "ERRORE CRITICO DI SISTEMA — Riavvia emergenza".  
**Coerente con:** crash subito dopo IAP, solo quando l’overlay appare (perché solo allora viene montato `M1UPill`).

---

## 5. Root cause candidate #2 (secondaria)

**Ipotesi:** setState dopo unmount nei timeout di `GlobalM1UCreditOverlay` (120 ms / 2800 ms).

**Analisi:**  
Il cleanup dell’`useEffect` (righe 53–57) fa `clearTimeout` di entrambi i timer. Se l’overlay **non** viene smontato prima dello scadere dei timeout, i callback chiamano `setVisible`, `setAmount`, ecc. su un componente ancora montato → nessun crash.  
Se invece il crash avviene **prima** (per root cause #1), l’ErrorBoundary sostituisce i figli con il fallback, quindi `GlobalM1UCreditOverlay` **viene smontato** e il cleanup viene eseguito → i timeout vengono annullati. In quel caso non si arriva a setState dopo unmount.  
Quindi la root cause #2 non spiega il crash **immediato** post-IAP; al massimo potrebbe essere rilevante in scenari di navigazione molto rapida (es. chiusura modal + cambio route nello stesso frame).  
**Verifica codice:** I timeout sono puliti in `return () => { ... }` dell’effect (righe 55–56). Nessun `isMounted` ref usato nei callback; in React 18 setState dopo unmount è soppresso, ma un ref “mounted” renderebbe il comportamento più esplicito.

---

## 6. FASE 0 — Stato repo (eseguito)

- **Branch:** `fix/m1u-slotloop-anim`
- **Ultimo commit:** `aca569c00 feat(welcome-bonus): 500→150 M1U + i18n WelcomeBonusModal (en/it/fr)`
- **Tag presente:** `safety/m1u-global-slot-engine-pre-fix-20260305-1549`
- **Modifiche non committate:** Sono presenti molte modifiche (file M, D, ??), inclusi `src/App.tsx`, `GlobalM1UCreditOverlay.tsx`, `m1uCreditEvent.ts`, vari componenti che usano `emitM1UCreditEvent`. Lo stato del repo non è pulito; la forensics si basa sul codice attuale dei file indicati.

---

## 7. FASE 2 — Isolamento (read-only)

- **"ERRORE CRITICO DI SISTEMA" / "Riavvia emergenza":**
  - `src/App.tsx` righe 236 e 247 (fallback dell’`ErrorBoundary`).
- **ErrorBoundary globale:**  
  - `src/App.tsx` riga 233: `<ErrorBoundary fallback={...}>` avvolge `ProductionSafetyWrapper` e quindi anche `GlobalM1UCreditOverlay`.
- **Listener `m1u-credit-event`:**  
  - `src/features/m1u/GlobalM1UCreditOverlay.tsx` riga 52: `window.addEventListener(M1U_CREDIT_EVENT, handleCreditEvent)`.
- **Listener `m1u-credited` / `m1u-balance-changed`:**  
  - `src/features/m1u/M1UPill.tsx` righe 350 e 252 (solo la pill ascolta; l’overlay **emette** questi eventi dopo 120 ms).
- **emitM1UCreditEvent:**  
  - Usato in Shop, FortuneWheel, CipherDrillModal, useWelcomeBonus, StreakModal, LotteryContent, ScratchWinModal, CashbackVaultPill, MicroMissionsCard, StreakWidget, ReferralCard, WeeklyChallenges, ClueMilestoneModal, LotteryTest, WordDuelMemoryModal, SignalPatternNumbersModal (grep confermato).

---

## 8. Checklist crash classici (solo verifica, nessuna modifica)

| Punto | Esito | Note |
|------|--------|------|
| Accesso a `window` / `document` senza guard | OK con guard | `emitM1UCreditEvent`: `if (typeof window === 'undefined' || amount <= 0) return;`. Overlay e pill usano `window` in effect/listener (ambiente browser). |
| `event.detail` non valido | Parziale | Overlay: `if (!detail?.amount || detail.amount <= 0) return;`. Non si valida `detail.id`/`detail.source` per il timeout; il callback usa `detail.amount` dalla closure (valido al momento della schedule). |
| Timer su componente smontato | Cleanup presente | Overlay: in unmount si fa `clearTimeout` per entrambi i timer (righe 55–56). Nessun ref “mounted” nei callback. |
| React render crash (pill) | **Sì — useUnifiedAuth** | La pill viene renderizzata **fuori** da `AuthProvider` quando è dentro `GlobalM1UCreditOverlay` → throw in `useUnifiedAuth`. |
| Event storm / ricorsione | Non causa diretta | Dedupe per `detail.id` e `animatingRef`; lock nella pill. Possibili rerender multipli ma non loop infinito identificato. |

---

## 9. Diagnosi differenziale: crash solo dopo IAP?

- **Perché si vede soprattutto post-IAP:**  
  L’overlay viene mostrato quando **qualunque** sorgente chiama `emitM1UCreditEvent`. Lo Shop è una di queste. La prima volta che `visible` passa a `true`, viene montato `M1UPill` **fuori** da `AuthProvider` → crash. Quindi il crash può avvenire anche con wheel/mission/referral ecc., non solo IAP: qualsiasi percorso che emette `m1u-credit-event` e fa apparire l’overlay **prima** che l’utente abbia mai visto quella UI può scatenarlo. In pratica l’IAP è il flusso più comune e immediato (pagamento → evento → overlay → render pill → crash).
- **Se il crash avviene solo post-IAP:**  
  Può dipendere da ordine di apertura/chiusura (es. Shop modal + overlay nello stesso albero) o dal fatto che altri flussi (wheel, mission) vengono testati con utente già “caldo” e albero già stabilizzato; la causa sottostante resta la posizione dell’overlay fuori da `AuthProvider`.

---

## 10. Raccomandazione FIX (solo descrizione, nessuna patch)

1. **Spostare `GlobalM1UCreditOverlay` dentro `AuthProvider`**  
   In `App.tsx`, rendere l’overlay figlio di `AuthProvider` (es. primo figlio, subito dopo l’apertura di `<AuthProvider>`), in modo che quando `visible === true` e viene renderizzato `M1UPill`, ci sia un antenato `AuthProvider` e `useUnifiedAuth()` non lanci.  
   **Nessuna modifica a:** StoreKit, IAP, receipt, accredito Supabase, BUZZ, login/logout, push, subscriptions.

2. **Alternativa:**  
   Introdurre una variante “overlay” di M1UPill che non usi `useUnifiedAuth` (o usi un contesto opzionale) e mostri solo il valore ricevuto dall’evento, senza dipendere da `userId`/realtime. Richiederebbe modifiche alla pill o a un wrapper e più attenzione a refetch/cache.

La raccomandazione principale è **(1)** perché risolve la causa con un solo spostamento di componente nel tree e resta in scope “solo UI/eventi”.

---

## 11. STOP RULE

Se in fase di fix emergesse che la soluzione richiede modifiche a StoreKit/IAP o alla logica di accredito Supabase, fermarsi e documentare in questo report che non è in scope.  
Le raccomandazioni sopra (spostare l’overlay dentro `AuthProvider` o variante “overlay” della pill) **non** toccano IAP né accredito.

---

**Fine report forense (READ-ONLY).**
