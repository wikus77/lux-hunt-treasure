# INCIDENT REPORT — NOTIFICATIONS: CLUE MODALS TRANSLATION FEASIBILITY (VERIFY ONLY)

**Date:** 2026-02-14  
**Context:** Indizi nei modali Notifications — valutazione fattibilità i18n senza toccare BUZZ  
**Vincolo:** SOLO verifica, nessuna patch applicata

---

## TASK 0 — ROLLBACK (PREPARAZIONE)

### Tag disponibili
| Tag | Note |
|-----|------|
| `SNAPSHOT_PRE_NOTIFICATIONS_I18N_20260214_035000` | Più recente, creato prima della patch i18n Notifications |
| `SNAPSHOT_PRE_POPUPS_I18N_20260213_164941` | Alternativa |
| `SNAPSHOT_PRE_HOME_I18N_PHASE4_FIXSAFE` | Alternativa |

### Comando rollback (NON eseguito)
```bash
git reset --hard SNAPSHOT_PRE_NOTIFICATIONS_I18N_20260214_035000
git clean -fd
npm run build
npx cap sync ios
```

### Raccomandazione
Se si pianifica una patch futura, creare un tag snapshot **prima** di modificare:
```bash
git tag SNAPSHOT_PRE_CLUE_MODALS_I18N_$(date +%Y%m%d_%H%M%S)
git push --tags
```

---

## TASK 1 — MAPPA COMPLETA NOTIFICATIONS → MODAL (READ PATH)

### 1.1 Route e component tree

| Elemento | File | Linee |
|----------|------|-------|
| Route `/notifications` | `src/routes/WouterRoutes.tsx` | 553–555 |
| Pagina montata | `Notifications` da `@/pages/Notifications` | — |
| Hook fetch | `useNotifications` | `src/hooks/useNotifications.ts` |

```
Notifications (pages/Notifications.tsx)
├── Tabs [Notifiche | Messaggi]
├── NotificationsHeader
├── NotificationsList
│   ├── NotificationCategory (per categoria)
│   │   ├── Card categoria
│   │   └── NotificationCategoryFlipOverlay (createPortal)
│   │       └── NotificationCategoryContent
│   │           ├── Header: title, contatori
│   │           ├── Stats: Totali | Non lette
│   │           ├── NotificationItem (lista)
│   │           └── Empty state
│   └── NotificationsEmptyState
```

### 1.2 Componente modal espanso (dettaglio)

| Elemento UI | Componente | File |
|-------------|------------|------|
| Modal overlay | `NotificationCategoryFlipOverlay` | `NotificationCategoryFlipOverlay.tsx` |
| Lista item | `NotificationCategoryContent` | `NotificationCategoryContent.tsx` |
| Card singola con "Contenuto completo" | `NotificationItem` | `NotificationItem.tsx` |

### 1.3 Tabella: UI element → source field → file:line

| UI Element | Source Field | File | Linea |
|------------|--------------|------|-------|
| Titolo card ("Nuovo Indizio BUZZ!") | `notification.title` | NotificationItem.tsx | 116 |
| Testo indizio (body) | `notification.description` | NotificationItem.tsx | 120, 174 |
| Data formattata | `notification.date` | NotificationItem.tsx | 118, 38–43 |
| Stato (Letta/Non letta) | `notification.read` | NotificationItem.tsx | 200 |
| "Contenuto completo", "Copia", ecc. | i18n `t(...)` | NotificationItem.tsx | già localizzato |

### 1.4 Fetch delle notifiche

| Tabella | Query | File | Linee |
|---------|-------|------|-------|
| `user_notifications` | `.select('*')` | useNotifications.ts | 125–129 |

Campi usati nella mappatura:
- `id` → id
- `title` → title
- `message` → description
- `created_at` → date
- `is_read` → read
- `type` → type

### 1.5 Origine del testo mostrato nel modal

| Fonte | Valore |
|-------|--------|
| **Tipo** | **A) notification.body / message già pronto** |
| Dettaglio | `user_notifications.message` → `notification.description` |
| Origine testo | Edge Function `handle-buzz-press` inserisce `message: clueText` |
| clueText | `prize_clues.description_it` (solo IT) |

**Conclusione:** Il testo indizio è generato/letto in IT da `handle-buzz-press` e salvato in `user_notifications.message`. La UI non fa join; legge solo quel campo.

---

## TASK 2 — CLUE REFERENCE RECUPERABILE?

### 2.1 Campi in user_notifications

| Campo | Presente? | Usato da handle-buzz-press? |
|-------|-----------|-----------------------------|
| clue_id | ❌ NO | ❌ |
| user_clue_id | ❌ NO | ❌ |
| prize_clue_id | ❌ NO | ❌ |
| entity_id / ref_id | ❌ NO | ❌ |
| metadata (JSONB) | ✅ Sì (migration 20250804) | ❌ handle-buzz-press non la popola |

### 2.2 Insert handle-buzz-press

```ts
// supabase/functions/handle-buzz-press/index.ts:677-684
await supabase.from('user_notifications').insert({
  user_id: user.id,
  type: 'buzz',
  title: '🎯 Nuovo Indizio BUZZ!',
  message: clueText   // ← solo testo IT, nessun clue_id
});
```

**Nessun clue_id o riferimento a entità viene salvato in user_notifications.**

### 2.3 Multilingua in DB

| Tabella | Colonne multilingua | Note |
|---------|---------------------|------|
| prize_clues | `description_it`, `description_en`, `description_fr` | Presenti (create-prize-clues-table) |
| user_clues | `title_it`, `description_it` | Solo IT |
| user_notifications | `message` | Solo testo singolo (IT) |

### 2.4 Lingua target sul client

| Meccanismo | Disponibile? | File |
|------------|--------------|------|
| i18next.language | ✅ | NotificationItem usa già `i18n.language` per date |
| profiles.preferred_language | Non verificato | — |
| Locale device | Non usato | — |

### 2.5 Best-case path (ID-based)

**Non percorribile senza modifiche BUZZ.**

Per mostrare EN/FR servirebbe:
1. `clue_id` (o simile) in `user_notifications`
2. Join: `user_notifications` → `user_clues` (clue_id) → `prize_clues` (id)
3. Lettura di `prize_clues.description_en` / `description_fr` in base a `i18n.language`

Dipendenze:
- Modifica a `handle-buzz-press`: inserire `metadata: { clue_id }` in `user_notifications`
- Modifica a `useNotifications`: estrarre e passare `metadata` / `clue_id`
- Query aggiuntiva o join per `prize_clues` da Notifications

**Vincolo:** modificare handle-buzz-press è FUORI SCOPE (NO BUZZ TOUCH).

---

## TASK 3 — VALUTAZIONE OPZIONI (NO PATCH)

### OPTION 1 — UI-only (lasciare indizio in IT)

| Criterio | Valutazione |
|----------|-------------|
| Complessità | S |
| Rischio | Low |
| Tempo | 0 (già fatto) |
| Impatto UX | Utente EN/FR vede indizi in IT; label, date e azioni localizzate |
| Failure modes | Nessuno |

**Nota:** Le label UI del modal sono già localizzate; solo il contenuto dell’indizio resta in IT.

---

### OPTION 2 — Client-side translation on-demand

| Criterio | Valutazione |
|----------|-------------|
| Complessità | L |
| Rischio | Med/High |
| Tempo | ~2–5 gg |
| Dipendenze | Servizio traduzione (API/LLM), cache locale per notification_id |
| Failure modes | Latenza, offline, costi, privacy, rate-limit, regressioni WKWebView |

**Rischi principali:**
- Latenza: 200–500 ms per chiamata
- Offline: nessuna traduzione
- Costi: ~$2–5/1M caratteri (DeepL/Google)
- Privacy: invio testo verso API esterne
- WKWebView: nessun rischio specifico individuato, ma aggiungere rete/cache può introdurre errori

---

### OPTION 3 — Server-side translation (backend/DB)

| Criterio | Valutazione |
|----------|-------------|
| Complessità | L |
| Rischio | High |
| Tempo | ~3–7 gg |
| Vincolo | Richiede modifica a pipeline notifiche (handle-buzz-press o trigger DB) |
| Failure modes | Doppia scrittura, schema DB, migrazione dati esistenti |

**Nota:** Per “non toccare BUZZ” si intende evitare modifiche dirette al flusso. Salvare traduzioni lato server comporta comunque cambiare:
- Schema (es. `message_en`, `message_fr` o tabella traduzioni)
- Chi inserisce le notifiche (handle-buzz-press o altro)
- Migrazioni per notifiche già esistenti

Quindi è da considerare “touching pipeline” indirettamente.

---

## TASK 4 — RISCHIO “BREAK NOTHING” (iOS WRAPPED)

| Rischio | Dove | Come testare |
|---------|------|--------------|
| createPortal / z-index | NotificationCategoryFlipOverlay | Aprire/chiudere modal su iPhone; verificare overlay e copertura corretta |
| Scroll locking | `document.body.style.overflow = 'hidden'` | Con modal aperto: scroll della pagina principale disabilitato |
| Liste lunghe | NotificationItem in lista | 20+ notifiche: scroll fluido, nessun jank |
| Safe-area / bottom nav | Modal fullscreen | iPhone con notch/home indicator: no overlap con nav |
| Stato Letta/Non letta | mark as read | Cambio stato e refresh; badge aggiornato |
| Copy-to-clipboard | navigator.clipboard.writeText | Long-press su contenuto: clipboard verificato su iOS |

### Punti critici

1. **Portal** (`m1-notifcategory-portal`, z-index 99999): verificare che non venga coperto da altri overlay (es. modali paywall).
2. **Scroll lock**: `overflow: hidden` su `body` può interagire con fix iOS per viewport; testare su Safari/WKWebView.
3. **Clipboard**: in WKWebView può richiedere gesto utente; il long-press dovrebbe soddisfare il requisito.

---

## DELIVERABLE FINALE

### 1. Verdetto

**POSSIBILE con tradeoff, ma NON senza modifiche al flusso BUZZ.**

- **ID-based (best-case):** possibile solo se handle-buzz-press inizia a salvare `clue_id` in `metadata` di `user_notifications`. Questo richiede modificare la Edge Function (BUZZ flow) → **vietato dai vincoli attuali**.
- **Solo client:** possibile con translation on-demand (Option 2), con rischi di latenza, offline e costi.
- **UI-only (Option 1):** già in uso; indizi restano in IT, resto dell’UI localizzato.

### 2. Informazione mancante

- **Dove:** `handle-buzz-press` non scrive `clue_id` in `user_notifications`.
- **Effetto:** nessun join Notifications → prize_clues per ottenere `description_en` / `description_fr`.
- **Dato disponibile ma non usato:** `prize_clues` ha `description_en`, `description_fr`; `user_clues` ha `clue_id` che punta a `prize_clues`, ma `user_notifications` non contiene alcun riferimento.

### 3. Strategia raccomandata

| Priorità | Strategia | Condizione |
|----------|-----------|------------|
| 1 | **ID-based join** | Solo se si accetta di modificare handle-buzz-press per salvare `metadata: { clue_id }` e adattare `useNotifications` + UI |
| 2 | **UI-only** | Mantenere stato attuale: label localizzate, indizi in IT |
| 3 | **Translation on-demand** | Solo se serve multilingua indizi senza modifiche BUZZ, accettando rischi di Option 2 |

### 4. Nessuna patch applicata

Questo documento è solo report di verifica; non sono state applicate modifiche al codice.

---

**Fine report**
