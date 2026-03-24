# Verifica forense: Pulse Breaker = modale fullscreen come Impostazioni

**Data:** 2026-03-11  
**Obiettivo:** Pulse Breaker deve aprirsi e apparire come il modale Impostazioni (fullscreen, un solo punto di rendering).

---

## 1. Confronto modali

| Aspetto | Modale Impostazioni | Modale Pulse Breaker (prima del fix) |
|--------|----------------------|--------------------------------------|
| **Pulsante** | Rotella in UnifiedHeader | Pill (PulseBreakerPill) + tap su barra PE (PulseBar/PulseBarPersonal) |
| **Azione al tap** | `setIsSettingsModalOpen(true)` | `openPulseBreaker()` (store) **e** rendering locale di `<PulseBreaker />` |
| **Dove viene renderizzato il modale** | **Un solo posto:** `<SettingsModal>` in UnifiedHeader → SettingsFlipOverlay + SettingsContent | **Due posti:** (1) GlobalPulseBreakerModal in App (SettingsFlipOverlay + PulseBreaker), (2) **PulseBreakerPill** e barre che renderizzavano **anche** `<PulseBreaker />` in locale (card/sheet) |
| **Risultato visivo** | Fullscreen, copre tutto lo schermo | L’utente vedeva la **versione card** (quella renderizzata dalla pill/barra), non quella fullscreen di GlobalPulseBreakerModal |

**Causa:** Più punti di rendering. Al tap sulla pill (o sulla barra) si apriva lo store **e** la pill/barra continuava a mostrare la propria istanza di `<PulseBreaker>` senza `renderAsContentOnly`, quindi la card/sheet (FOTO 2). Il modale fullscreen (GlobalPulseBreakerModal) esisteva ma la card locale era quella visibile.

---

## 2. Principio applicato (come Impostazioni)

- **Un solo modale:** il contenuto fullscreen è mostrato da un unico componente (GlobalPulseBreakerModal in App), che usa SettingsFlipOverlay + PulseBreaker con `renderAsContentOnly`.
- **Pulsanti solo “aprono”:** pill e barre non devono renderizzare nessuna istanza di PulseBreaker; devono solo chiamare `openPulseBreaker()`.

---

## 3. Modifiche effettuate (solo in scope)

1. **PulseBreakerPill.tsx**
   - Rimosso il rendering di `<PulseBreaker isOpen={...} onClose={...} />`.
   - La pill ora contiene solo il bottone che chiama `openPulseBreaker()`.
   - Rimosso import di `PulseBreaker` e uso di `isOpen`/`closePulseBreaker` dalla pill.

2. **PulseBar.tsx**
   - Rimosso stato locale `isGameOpen` e rendering di `<PulseBreaker />`.
   - Al tap sulla barra (senza `onTap`): `openPulseBreaker()` invece di `setIsGameOpen(true)`.
   - Import: `usePulseBreakerStore` al posto di `PulseBreaker` e `isPulseBreakerEnabled` (non più usati qui).

3. **PulseBarPersonal.tsx**
   - Stesso schema di PulseBar: rimosso `isGameOpen` e rendering locale di `<PulseBreaker />`.
   - Tap sulla barra: `openPulseBreaker()`.
   - Import aggiornati come in PulseBar.

**Nessuna modifica a:** GlobalPulseBreakerModal, SettingsFlipOverlay, PulseBreaker (logica `renderAsContentOnly`), Settings, paletti, altre feature.

---

## 4. Flusso dopo il fix

- **Pill** → `openPulseBreaker()` → store `isOpen = true` → **solo** GlobalPulseBreakerModal (in App) renderizza SettingsFlipOverlay + PulseBreaker → **modale fullscreen**.
- **PulseBar / PulseBarPersonal** → stesso flusso: `openPulseBreaker()` → stesso modale fullscreen.
- **NextActionCard / PulseBreakerInfoPopup** → già usavano solo `openPulseBreaker()` → nessun cambiamento necessario.

---

## 5. Build e regressioni

- `npm run build` completato con successo.
- Nessuna modifica fuori scope; paletti rispettati.

---

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
