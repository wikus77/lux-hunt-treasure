# Glossario M1SSION™
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 1.0  
**Last Updated:** 2025-10-03  
**Status:** OFFICIAL PRODUCT BIBLE

---

## A

### Agent Code
**Definizione:** Codice identificativo univoco formato `AG-XXXX` assegnato automaticamente a ogni utente al momento della registrazione.  
**Esempio:** `AG-X0197`, `AG-1A2B`  
**Uso:** Identificazione rapida utente, referral tracking, leaderboard.

---

## B

### BUZZ
**Definizione:** Azione attiva di scansione geolocalizzata (raggio 2 km) che sblocca indizi/aree secondo tier abbonamento. Ha cooldown anti-abuso (24h Free → nessuno Titanium).  
**Riferimento:** Vedi `buzz-and-map.md` per specifiche complete.

### BUZZ Map
**Definizione:** Variante contestuale di BUZZ eseguita dalla visualizzazione mappa con feedback visivo immediato (aree sbloccate, markers premi). Primo BUZZ Map speciale: 500 km raggio a €4,99.  
**Differenza chiave:** BUZZ = azione rapida ovunque; BUZZ Map = esplorazione strategica mappa.

---

## C

### Clue (Indizio)
**Definizione:** Informazione progressiva che l'utente sblocca via BUZZ/BUZZ Map per avvicinarsi al premio. Indizi organizzati per livello (1-5) e tier (Free vede solo livello 1, Titanium tutti).  
**Tipi:** Testuale, visuale (immagine), geografico (coordinate parziali), enigmatico (richiede decifratura).

### Cooldown
**Definizione:** Tempo di attesa obbligatorio tra azioni ripetute (BUZZ, Final Shot) per prevenire abusi. Varia per tier.  
**BUZZ Cooldown:** Free 24h, Silver 12h, Gold 8h, Black 4h, Titanium 0h.  
**Final Shot Cooldown:** Free/Silver 2h, Gold 1h, Black 30min, Titanium 0h.

---

## E

### Early Access
**Definizione:** Accesso anticipato a nuove missioni riservato a tier premium. Tempistiche: Titanium 72h, Black 48h, Gold 24h, Silver 2h prima del lancio pubblico (Free).  
**Scopo:** Incentivo upgrade tier + distribuzione carico server.

---

## F

### Fair Play Policy
**Definizione:** Insieme di regole anti-frode per garantire equità gioco. Proibito: GPS spoofing, multi-accounting, bot, exploit bug. Sanzioni progressive: warning → ban temporaneo → ban permanente.  
**Riferimento:** Vedi `policies.md` Fair Play Policy.

### Final Shot
**Definizione:** Tentativo finale di claim premio quando utente ritiene di aver trovato posizione esatta. Richiede GPS accuracy <20m, tolleranza successo <50m da target. Tentativi limitati per tier (Free 2, Titanium 12).  
**Riferimento:** Vedi `final-shot.md` per regole complete.

---

## G

### GPS Mock Detection
**Definizione:** Sistema anti-frode che rileva tentativi di falsificare posizione GPS tramite accuracy check, velocity impossibili, pattern anomali.  
**Conseguenze:** Ban progressivo secondo Fair Play Policy.

---

## I

### Investigative Style
**Definizione:** Profilo personalità investigativa utente determinato da quiz onboarding (4 domande). Influenza suggerimenti AI Norah, stile comunicazione, e tipo indizi preferiti.  
**Tipi:** Analitico, Intuitivo, Metodico, Creativo.

---

## M

### Mission (Missione)
**Definizione:** Caccia al tesoro geolocalizzata con premio fisico (es. Rolex, Lamborghini). Durata variabile (settimane/mesi). Utente sblocca indizi via BUZZ e tenta Final Shot per vincere.  
**Componenti:** Indizi progressivi, cooldown tier-based, early access, Final Shot.

---

## N

### NBA Pills
**Definizione:** "Next Best Action" — suggerimenti interattivi proposti da NORAH AI per guidare utente verso azioni ottimali (es. "Sblocca prossimo indizio", "Prova BUZZ Map", "Upgrade tier per bonus").  
**Implementazione:** Bottoni tap-to-action nella chat NORAH.

### NORAH
**Definizione:** AI Assistant conversazionale M1SSION disponibile 24/7. Risponde a domande, dà suggerimenti strategici, ricorda conversazioni (se consenso), e adatta linguaggio a tier/progressione.  
**Capacità speciali Titanium:** Hint direzionali post Final Shot fallito, accesso completo Knowledge Base.

---

## P

### Prize (Premio)
**Definizione:** Oggetto fisico di valore nascosto in location geografica specifica. Vinto via Final Shot <50m da coordinate esatte. Validazione admin richiesta per claim finale.  
**Esempi passati:** Rolex Submariner, Lamborghini Huracán, iPhone 16 Pro Max.

---

## R

### RAG (Retrieval-Augmented Generation)
**Definizione:** Sistema AI che recupera documenti Knowledge Base pertinenti (via embedding search) e li usa per generare risposte contestuali accurate. Usato da NORAH per rispondere a domande specifiche M1SSION.  
**Tecnologia:** pgvector + OpenAI embeddings + Lovable AI Gateway.

### RLS (Row-Level Security)
**Definizione:** Politiche database Supabase che limitano accesso dati per utente (`auth.uid() = user_id`). Garantisce utenti vedano solo propri dati (sessioni, indizi, tentativi Final Shot).  
**Riferimento:** Vedi migration SQL per policy specifiche.

---

## S

### Streak (Sequenza)
**Definizione:** Giorni consecutivi login utente. Influenza bonus/reward (TODO: definire meccanica esatta).  
**Tracking:** Campo `streak_days` in `agent_profiles`.

### Subscription Tier
**Definizione:** Livello abbonamento utente che determina limiti BUZZ, BUZZ Map, Final Shot, early access, feature premium.  
**Tier disponibili:** Free, Silver (€9,99/mese), Gold (€19,99/mese), Black (€49,99/mese), Titanium (€99,99/mese).  
**Riferimento:** Vedi `subscriptions.md` per tabella comparativa completa.

---

## T

### Telemetry
**Definizione:** Sistema logging analytics anonimizzato per tracciare eventi utente (BUZZ, Final Shot, conversazioni AI) e migliorare UX. GDPR-compliant, no PII sensibile.  
**Tabelle:** `ai_events`, `norah_events`, `ai_sessions`.

---

## U

### User ID
**Definizione:** UUID univoco assegnato da Supabase Auth alla registrazione. Usato come chiave primaria in tutte tabelle user-scoped. Non confondere con Agent Code (visibile) vs User ID (interno).  
**Formato:** `550e8400-e29b-41d4-a716-446655440000` (UUID v4)

---

## FAQ Comuni (per RAG Assistant)

**Q: Qual è la differenza tra Agent Code e User ID?**  
A: Agent Code è identificativo visibile formato `AG-XXXX` per utente (es. leaderboard). User ID è UUID interno database (es. `550e8400...`) usato per RLS e relazioni tabelle.

**Q: BUZZ e BUZZ Map sono la stessa cosa?**  
A: Logica identica, contesto diverso. BUZZ = azione rapida ovunque. BUZZ Map = azione dalla mappa con visualizzazione immediata aree/premi. Primo BUZZ Map ha condizioni speciali (500 km / €4,99).

**Q: Cos'è NBA Pills?**  
A: Next Best Action — suggerimenti interattivi AI Norah per guidare utente verso azioni ottimali. Esempio: "🎯 Sblocca prossimo indizio con BUZZ Map" (tap per azione diretta).

---

## Note per Developer

- **Naming conventions:** Snake_case database, camelCase JavaScript/TypeScript, kebab-case file/URL
- **Acronimi:** Sempre uppercase (GPS, AI, RAG, RLS, UUID, API)
- **Localizzazione:** Glossario disponibile in IT (primario), EN, FR via i18n
- **Aggiornamento:** Quarterly review + on-demand per nuove feature

---

**IMPORTANT:** L'assistente AI deve usare terminologia esatta da questo glossario. Mai inventare termini non documentati. Se utente chiede definizione non presente, rispondere "Non documentato ancora nel glossario ufficiale".

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
