# BUZZ CLUES I18N AUDIT REPORT

**Date:** 2026-02-14  
**Context:** Indizi BUZZ solo in italiano — utenti EN/FR vedono contenuto IT  
**Tag rollback:** `SNAPSHOT_PRE_BUZZ_CLUES_I18N_AUDIT_20260214_033313`  
**Scope:** READ-ONLY — nessuna patch applicata

---

## TASK 0 — ROLLBACK (PRONTO)

```bash
git reset --hard SNAPSHOT_PRE_BUZZ_CLUES_I18N_AUDIT_20260214_033313
git clean -fd
```

---

## TASK 1 — PIPELINE BUZZ → CLUE

### 1.1 Sorgente dati degli indizi

| Sorgente | Tabella / File | Ruolo |
|----------|----------------|-------|
| **DB Supabase** | `prize_clues` | Indizi settimanali (Week 1-4) inseriti manualmente da Joseph |
| **DB Supabase** | `user_clues` | Indizi assegnati all'utente (persistenza) |
| **Client** | `useBuzzGrants.ts` | Free BUZZ: genera clue e insert in `user_clues` (bypass Edge) |
| **Client** | `useBuzzFeature.ts` | Legato a vecchio flow — non usato da BuzzActionButton |

**Tabelle Supabase coinvolte:**
- `prize_clues`: id, prize_id, week, type, clue_category, **title_it**, **description_it**, order_index, ...
- `user_clues`: id, user_id, clue_id, **title_it**, **description_it**, clue_type, buzz_cost, ...

**Command Center (inserimento manuale):**
- Route: `/panel` → `PanelAccessPage` → `MissionCommandCenter` → `ManualCluesEditor`
- File: `src/components/panel/ManualCluesEditor.tsx`
- Insert: `supabase.from('prize_clues').insert({ title_it, description_it, week, ... })`
- Solo campi `_it` — nessun campo EN/FR

### 1.2 Flusso BUZZ → assegnazione indizio

```
┌─────────────────────┐
│  User tap BUZZ      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────────────────────┐
│ BuzzActionButton    │────►│ useBuzzHandler.handleBuzz()   │
│ (BuzzPage)          │     │                              │
└─────────────────────┘     └──────────┬───────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │ FREE BUZZ                 │ PAID BUZZ (M1U)           │
           ▼                           ▼                           │
┌─────────────────────┐     ┌──────────────────────────────┐      │
│ useBuzzGrants       │     │ useBuzzApi.callBuzzApi()     │      │
│ consumeFreeBuzz()   │     │ → handle-buzz-press Edge Fn  │      │
│ insert user_clues   │     └──────────┬───────────────────┘      │
│ title_it, desc_it   │                │                           │
└─────────────────────┘                ▼                           │
                           ┌──────────────────────────────┐       │
                           │ handle-buzz-press/index.ts   │       │
                           │ 1. Check enrollment          │       │
                           │ 2. Get missionId, currentWeek│       │
                           │ 3. Query user_clues (unlock) │       │
                           │ 4. Query prize_clues         │       │
                           │    .select('description_it') │       │
                           │    .eq('clue_category', …)   │       │
                           │ 5. Pick first available clue │       │
                           │ 6. Insert user_clues         │       │
                           │    title_it, description_it  │       │
                           │ 7. Return clue_text          │       │
                           └──────────────────────────────┘       │
```

**Punto di scelta indizio:** `handle-buzz-press` linee 497-556  
- Legge solo `description_it` da `prize_clues`  
- Nessun parametro lingua nella request  
- Fallback: `"Indizio non disponibile"`, `"Hai sbloccato tutti gli indizi..."`, ecc. (tutti IT)

**Persistenza:** `handle-buzz-press` linee 731-746  
- Insert `user_clues` con `title_it`, `description_it`  
- Nessun campo `_en` o `_fr` in `user_clues`

### 1.3 Rendering indizi lato utente

| Componente | File | Prop / campo usato | Contenuto |
|------------|------|--------------------|-----------|
| FoundCluesDisplay | `src/components/clues/FoundCluesDisplay.tsx` | `clue.title_it`, `clue.description_it` | Lista indizi trovati |
| AgentDiaryContent | `src/components/command-center/home-sections/AgentDiaryContent.tsx` | `clue.title_it` | "🔍 Indizio scoperto: {title_it}" |
| ManualCluesEditor | `src/components/panel/ManualCluesEditor.tsx` | `clue.description_it` | Editor admin |
| PrizeClueModal | `src/components/prizes/PrizeClueModal.tsx` | `clue.title_it`, `clue.description_it` | Modal sblocco indizio |
| ClueDetail | `src/components/prizes/ClueDetail.tsx` | title_it, description_it | Dettaglio indizio |

**Toast BUZZ:** `useBuzzHandler` mostra `buzzResult.clue_text` (restituito da Edge) — già in italiano.

### 1.4 Lingua: fonte attuale

| Fonte | Dove | Persistenza |
|-------|------|-------------|
| `profiles.preferred_language` | Migration `20251203_add_preferred_language.sql` | DB, default `'it'` |
| `i18next.language` | App React | Session/browser |
| Device locale | iPhone Settings | Sistema |

**Nessuna logica** usa `preferred_language` o `i18next.language` per:
- Selezionare la versione dell'indizio
- Filtrare `prize_clues` per lingua
- Mostrare `title_en` / `description_en` al posto di `_it`

---

## TASK 2 — DATABASE / SUPABASE

### Schema ricostruito

**prize_clues** (da migrations + ManualCluesEditor + handle-buzz-press):

| Campo | Tipo | Note |
|-------|------|------|
| id | UUID | PK |
| prize_id | UUID | FK prizes |
| week | INTEGER | 1-4 |
| type | TEXT | LOCATION \| PRIZE |
| clue_category | TEXT | location \| prize |
| title_it | TEXT | ✅ Usato |
| description_it | TEXT | ✅ Usato |
| order_index | INTEGER | Ordine erogazione |
| is_fake, is_decoy | BOOLEAN | — |
| ... | | |

**Colonne multilingua esistenti (create-prize-clues-table):**
- `title_en`, `description_en` — presenti in alcune migration ma **non usate** da ManualCluesEditor né da handle-buzz-press.

**user_clues** (da types.ts + migrations):

| Campo | Tipo | Note |
|-------|------|------|
| id | UUID | PK |
| user_id | UUID | FK |
| clue_id | TEXT | UUID clue o buzz_* |
| title_it | TEXT | ✅ Unico titolo |
| description_it | TEXT | ✅ Unica descrizione |
| clue_type | TEXT | buzz, buzz_map, … |
| buzz_cost | INTEGER | — |

**Nessuna colonna** `title_en`, `description_en`, `title_fr`, `description_fr` in `user_clues`.

**profiles:**
- `preferred_language VARCHAR(5) DEFAULT 'it'` — esiste ma non utilizzato per i clue.

---

## TASK 3 — REPORT E STRATEGIA

### 3.1 Stato attuale (fact-based)

| Aspetto | Situazione |
|---------|------------|
| Dove sono gli indizi | `prize_clues` (manuali), `user_clues` (assegnati) |
| Come vengono assegnati | handle-buzz-press legge `prize_clues.description_it`, insert in `user_clues` con `title_it`/`description_it` |
| Dove vengono mostrati | FoundCluesDisplay, AgentDiaryContent, PrizeClueModal, toast BUZZ |
| Blocco alla localizzazione | 1) `prize_clues` e `user_clues` usano solo `_it` 2) handle-buzz-press non riceve lingua 3) Command Center inserisce solo IT 4) Nessun fallback per EN/FR |

### 3.2 Opzioni (PRO/CONTRO)

#### Opzione A — Multi-field DB (title_it, title_en, title_fr, description_it, …)

| Pro | Contro |
|-----|--------|
| Schema esplicito, query semplice | Molte colonne, migrazione estesa |
| RLS e tipi chiari | Ogni nuova lingua = ALTER TABLE |
| Facile validazione “tutti i campi compilati” | — |

**Effort:** Medio-alto. Migrazione + ManualCluesEditor + handle-buzz-press + rendering.

#### Opzione B — JSONB per lingua

`copy: { "it": "...", "en": "...", "fr": "..." }`

| Pro | Contro |
|-----|--------|
| Flessibile, nuove lingue senza ALTER | Query JSONB meno comode |
| Un solo campo per testo | Validazione più complessa |
| Coerente con pattern i18n moderno | — |

**Effort:** Medio. Migrazione schema + adattamento read/write.

#### Opzione C — Record per lingua

3 righe per clue con `language_code`, stesso `clue_group_id`.

| Pro | Contro |
|-----|--------|
| Normale, JOIN per lingua | Più righe, logica di join più articolata |
| Facile aggiungere lingue | Modifica logica di selezione clue (handle-buzz-press) |

**Effort:** Alto. Cambia modello dati e flusso di selezione.

#### Opzione D — Gating + fallback controllato

Se manca EN/FR, non assegnare indizio a utenti EN/FR (o assegnare IT con disclaimer).

| Pro | Contro |
|-----|--------|
| Implementazione minima | UX negativa: utente paga e non riceve indizio |
| Evita mostrare IT a utenti EN/FR | Non risolve il problema di base |

**Sconsigliato.**

#### Opzione E — Traduzione automatica con approvazione

Pipeline asincrona: tradurre IT → EN/FR, review, poi pubblicare.

| Pro | Contro |
|-----|--------|
| Scalabile | Complessità, ritardi, costo |
| Joseph mantiene controllo | Richiede UI di review e stati (bozza/pubblicato) |

**Effort:** Molto alto. Non adatto come prima mossa.

---

### 3.3 Raccomandazione: **Opzione A (Multi-field)**

**Motivazioni:**
1. Coerente con naming esistente (`title_it`, `description_it`)
2. `create-prize-clues-table` e alcune migration già prevedono `title_en`, `description_en` — estensione naturale
3. Query semplici: `SELECT description_it, description_en, description_fr` e scelta in base a `preferred_language`
4. Command Center può evolversi con campi EN/FR senza cambiare modello dati
5. Gating possibile: se `description_en` è NULL per un clue, fallback sicuro a `description_it` (evitare crash)

**File/tabelle toccati:**
- Migration: `prize_clues` (+ `title_en`, `description_en`, `title_fr`, `description_fr`)
- Migration: `user_clues` (+ idem)
- `handle-buzz-press`: accetta header/param `Accept-Language` o `preferred_language`, seleziona campo corretto
- `ManualCluesEditor`: form con campi IT/EN/FR (o tab)
- `FoundCluesDisplay`, `AgentDiaryContent`, `PrizeClueModal`, `ClueDetail`: leggere `description_${lang}` con fallback a `_it`
- `useBuzzGrants`: generare o mappare clue multilingua

**Rischi:**
- Clues già esistenti: `_en`/`_fr` NULL → fallback a `_it` obbligatorio
- Joseph deve compilare EN/FR per nuovi indizi (o accettare fallback IT)

**Garanzia EN/FR non vedano IT puro:**  
- Se `preferred_language` = 'en' e `description_en` è NULL → mostrare messaggio tipo "Traduzione in arrivo" OPPURE fallback a `description_it` con label "(Italiano)".  
- Scelta di prodotto: gating rigoroso (niente clue se manca lingua) vs fallback con trasparenza.

---

### 3.4 Piano di implementazione (NO PATCH IN QUESTO TASK)

| Step | Azione |
|------|--------|
| 0 | Rollback: `git reset --hard SNAPSHOT_PRE_BUZZ_CLUES_I18N_AUDIT_20260214_033313` |
| 1 | Migration: aggiungere a `prize_clues` e `user_clues` le colonne `title_en`, `description_en`, `title_fr`, `description_fr` (nullable) |
| 2 | Command Center: estendere ManualCluesEditor con input EN/FR (opzionali), salvare nei nuovi campi |
| 3 | Edge handle-buzz-press: leggere `preferred_language` (profiles o header), selezionare `description_${lang}` con fallback `description_it`, scrivere in `user_clues` i campi corrispondenti |
| 4 | Rendering: FoundCluesDisplay, AgentDiaryContent, PrizeClueModal, ClueDetail — usare `i18n.language` o prop `lang` per leggere `title_${lang}` / `description_${lang}` con fallback a `_it` |
| 5 | useBuzzGrants: localizzare "🎁 Indizio BUZZ Gratuito" e clue generato (o usare chiavi i18n) |
| 6 | Test: iPhone IT → EN → FR, BUZZ paid, verifica clue nella lingua corretta |
| 7 | Rollback plan: tag `SNAPSHOT_PRE_BUZZ_CLUES_I18N_AUDIT_20260214_033313` |

---

## ROLLBACK COMANDO FINALE

```bash
git reset --hard SNAPSHOT_PRE_BUZZ_CLUES_I18N_AUDIT_20260214_033313
git clean -fd
```

---

## PROSSIMO PASSO: PATCH MODE

Quando approvato, usare un secondo prompt **"PATCH MODE"** per:
1. Creare migration schema
2. Modificare handle-buzz-press
3. Aggiornare ManualCluesEditor
4. Aggiornare componenti di rendering

**Nessuna patch è stata applicata in questa esecuzione.**
