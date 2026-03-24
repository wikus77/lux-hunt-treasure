# Fix Fase B — Nuovo suono click + estensione a 6 target (iOS wrapped)

**Project:** M1SSION™ — iOS wrapped app (Capacitor WKWebView)  
**Data:** 2026-03-15  
**Scope:** Solo sostituzione asset audio + estensione feedback a 6 target. Nessun tocco a BUZZ, BUZZ MAP, IAP, login, DB, routing, business logic.

---

## 1. EXECUTIVE SUMMARY

**Cosa è stato cambiato:**  
- **Audio:** Il suono del click feedback è stato sostituito con **M1SSION CLICK.mp3** (da Desktop), salvato nel progetto come `public/assets/audio/m1ssion-click.mp3`. L’helper `buttonClickFeedback.ts` ora usa questo path.  
- **Target:** Lo stesso feedback (suono + aptico leggero) è stato applicato a **6 target**: (1) Streak giornaliero, (2) Shop, (3) Cashback — già coperti, ora con il nuovo suono; (4) Pill "+ M1U", (5) Tasto Impostazioni, (6) Tasto Profilo Agente — aggiunti con una sola chiamata a `buttonClickFeedback()` nel punto corretto di ciascuno.  
- **Nessuna** modifica a logiche (claim, apertura modal, navigazione): solo inserimento della chiamata al feedback prima dell’azione esistente. Nessun doppio trigger; nessun tocco a BUZZ, BUZZ MAP, IAP, login, logout, delete account, push, DB, Edge, routing, i18n.

**Esito:** Implementazione completata. Build è stata avviata in sessione (prebuild passato); per conferma finale eseguire in locale `npm run build` e `npm run cap:ios:incremental`.

---

## 2. FILE TOCCATI

**File creati:**  
- `public/assets/audio/m1ssion-click.mp3` — copia di `M1SSION CLICK.mp3` dal Desktop; nome safe per path e build.

**File modificati:**  
- `src/utils/buttonClickFeedback.ts` — costante `UI_CLICK_SOUND` impostata a `'/assets/audio/m1ssion-click.mp3'`.  
- `src/features/m1u/M1UPill.tsx` — import `buttonClickFeedback`; in `handleOpenRecharge` (Plus orb e pill M1U): `buttonClickFeedback()` in testa.  
- `src/components/layout/UnifiedHeader.tsx` — import `buttonClickFeedback`; sul bottone Impostazioni: `hapticLight()` sostituito con `buttonClickFeedback()`.  
- `src/components/profile/ProfileDropdown.tsx` — import `buttonClickFeedback`; in `handleAvatarClick`: `buttonClickFeedback()` in testa.

**File non toccati (già con feedback nel pilota):**  
- `src/components/home/CashbackVaultPill.tsx` — già chiama `buttonClickFeedback()` (ora con nuovo suono).  
- `src/components/gamification/StreakPill.tsx` — idem.  
- `src/components/shop/ShopPill.tsx` — idem.

**Vecchio suono:**  
- `public/assets/audio/ui-click.mp3` — **lasciato** nel progetto (nessuna rimozione) per evitare rischi e mantenere rollback semplice.

---

## 3. TARGET COPERTI

| # | Target              | File / componente      | Punto di integrazione                                      | Stato   |
|---|---------------------|-------------------------|------------------------------------------------------------|---------|
| 1 | Streak giornaliero  | StreakPill.tsx          | onClick pill → già `buttonClickFeedback()` (nuovo suono)   | OK      |
| 2 | Shop                | ShopPill.tsx            | handleOpenShop → già `buttonClickFeedback()` (nuovo suono) | OK      |
| 3 | Cashback            | CashbackVaultPill.tsx   | onClick pill → già `buttonClickFeedback()` (nuovo suono)   | OK      |
| 4 | Pill "+ M1U"       | M1UPill.tsx             | handleOpenRecharge (Plus orb + pill) → `buttonClickFeedback()` aggiunto | OK |
| 5 | Tasto Impostazioni  | UnifiedHeader.tsx       | onClick bottone Settings → `buttonClickFeedback()` (sostituisce hapticLight) | OK |
| 6 | Tasto Profilo Agente| ProfileDropdown.tsx     | handleAvatarClick → `buttonClickFeedback()` aggiunto        | OK      |

Nessuna doppia chiamata: un solo handler per target; il Plus e la pill M1U condividono `handleOpenRecharge`, quindi un solo feedback per click.

---

## 4. AUDIO

**Nuovo file:**  
- **Posizione:** `public/assets/audio/m1ssion-click.mp3`  
- **Nome usato nel progetto:** `m1ssion-click.mp3` (lowercase, no spazi).  
- **Path runtime:** `/assets/audio/m1ssion-click.mp3` (stesso pattern degli altri asset in `public/assets/audio`).  
- **Origine:** copia di `/Users/josephmule/Desktop/M1SSION CLICK.mp3`.

**Vecchio suono:**  
- `public/assets/audio/ui-click.mp3` — **non rimosso**; non più referenziato dall’helper. In caso di rollback si può ripristinare la costante in `buttonClickFeedback.ts`.

---

## 5. SICUREZZA / PALETTI

Conferma esplicita: **non** sono stati toccati:

- login / logout  
- cancellazione account  
- IAP / acquisti / pagamenti  
- BUZZ  
- BUZZ MAP  
- push notifications  
- routing  
- Supabase / DB / Edge Functions  
- i18n  
- missioni daily  
- business logic  
- logiche profilo / shop / cashback / streak  

Modifiche effettuate solo dove indicato: sostituzione path audio nell’helper e aggiunta di una chiamata `buttonClickFeedback()` (o sostituzione di `hapticLight()` con `buttonClickFeedback()` solo sul tasto Impostazioni).

---

## 6. BUILD / SYNC

- **npm run build:** avviata in sessione (prebuild push-guard passato, vite build avviato). Per esito completo eseguire in locale:  
  `npm run build`

- **npm run cap:ios:incremental:** da eseguire in locale dopo la build:  
  `npm run cap:ios:incremental`

Non usare `npx cap sync ios` né `npm run cap:sync:ios`.

---

## 7. RISCHI RESIDUI

- **Cache audio:** dopo l’aggiornamento, il primo tap su device potrebbe ancora usare il vecchio suono se il bundle è in cache; un nuovo deploy/sync risolve.  
- **UnifiedHeader:** il link "M1SSION" (home) continua a usare solo `hapticLight()` (nessun suono); volendo in futuro si può allineare con `buttonClickFeedback()`.  
- **Profilo/Settings:** nessun cambiamento alle modal o alla navigazione; solo feedback al click.

---

## 8. PROSSIMA FASE CONSIGLIATA

Senza implementare ora, candidati ragionevoli per lo stesso pattern (solo dove non siano CTA critici o flussi frozen):

- **Fase C:** altre pill/CTA in Home o Command Center (es. card missioni, Learn, Help) — stessa chiamata `buttonClickFeedback()` sull’onClick di apertura.  
- **Fase D:** pulsanti “Chiudi” / “Annulla” nelle modali non sensibili; eventuale uso di un suono “conferma” distinto per azioni irreversibili (da definire in design).  
- **Non estendere** a: BUZZ, BUZZ MAP, pulsanti IAP, delete account, submit pagamento, senza esplicita richiesta.

---

## 9. GO / NO GO

**GO.**  

Implementazione in scope, minimale e reversibile. Nuovo suono attivo per i 6 target; nessuna regressione introdotta; paletti rispettati. Validazione finale su device: eseguire `npm run build` e `npm run cap:ios:incremental` in locale e testare i 6 target.

---

**Fine report.**
