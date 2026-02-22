# PRIVACY MODAL — “Download My Data” CTA — Verifica funzionamento + gap GDPR/Apple (NO PATCH)

**Data:** 2026-02-22  
**Scope:** SOLO lettura codice + tracing + report. Nessuna modifica effettuata.

---

## Phase 0 — Rollback safety (preparazione)

- **git status:** working tree con modifiche (branch fix/ui-modals-hide-quickactions-move-dangerzone-20260222, file M e ?? come da sessione corrente).
- **Branch:** `fix/ui-modals-hide-quickactions-move-dangerzone-20260222`
- **Ultimo commit:** `1dc44812 chore(safety): snapshot before iOS avatar realtime + photolibrary + text fixes`

*(Nessun tag/rollback eseguito; report read-only.)*

---

## 1) Stato CTA: **NON IMPLEMENTATO**

Il pulsante “Download My Data” è presente solo a livello UI. **Non è collegato ad alcun handler**: al click non viene eseguita alcuna azione.

---

## 2) Evidenze (file:line + handler + endpoint)

### Bottone e componente

- **File:** `src/components/settings/sections/PrivacySectionContent.tsx`
- **Righe bottone:** **197–213**
- **Modale Privacy:** stesso file (`PrivacySectionContent`), aperto da Settings → sezione Privacy (lazy `PrivacySectionContent` in `SettingsContent.tsx`).

**Snippet (righe 197–213):**

```tsx
          <button style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(0, 209, 255, 0.15)',
            border: '1px solid rgba(0, 209, 255, 0.3)',
            color: '#00D1FF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Download size={16} />
            {t('download_my_data')}
          </button>
```

- **onClick:** assente (nessuna prop `onClick` sul `<button>`).
- **Handler:** nessuno.
- **Endpoint / Edge Function:** nessuno. In repo non esiste una funzione tipo `export-user-data`, `gdpr-export`, `download-my-data` in `supabase/functions`. Nessuna chiamata da frontend a export dati utente.
- **Blob / download:** nessun uso in questo componente. L’unico pattern simile è in `DiagnosticsSettings.tsx` (righe 134–141: Blob JSON + `URL.createObjectURL` + `<a download>`), non collegato al CTA Privacy.
- **Capacitor:** nessun uso di `@capacitor/filesystem` o `@capacitor/share` in `src` per download/share file (ricerca a progetto: 0 match).

---

## 3) Root cause (se non funziona)

- **Causa:** il CTA è stato implementato solo come elemento visivo (label i18n `download_my_data` in en/it/fr), senza alcuna logica al click.
- **Punto esatto:** `PrivacySectionContent.tsx` 197–213: `<button>` senza `onClick`. L’azione “muore” qui: nessun codice viene eseguito.

---

## 4) Piano per farlo funzionare (NO PATCH — solo architettura e passi)

Architettura consigliata per iOS (WKWebView): **Edge Function “export-user-data” + file share**.

### Passi tecnici minimi

1. **Backend**
   - Creare Edge Function autenticata (es. `export-user-data` o `gdpr-export`) che:
     - Legge da Supabase (e da storage se necessario) tutti i dati dell’utente autenticato (vedi tabella sotto).
     - Genera un export in JSON (e/o ZIP se si includono file).
     - Restituisce corpo JSON (export piccoli) oppure scrive su Storage e restituisce URL firmato (export grandi).
   - Policy di accesso: solo utente autenticato, solo i propri dati; rate limit (es. 1 export / N ore) e log/audit degli accessi.

2. **Frontend (Privacy modal)**
   - Aggiungere `onClick` al bottone che:
     - Chiama `supabase.functions.invoke('export-user-data')` (o nome scelto).
     - Riceve JSON (o URL firmato), crea `Blob` + `URL.createObjectURL` e innesca download (es. `<a download>` come in DiagnosticsSettings) oppure, su iOS, salva con Filesystem e apre Share sheet (richiederebbe aggiunta plugin Capacitor Filesystem/Share se si vuole UX nativa).

3. **Dataset da includere (source of truth in repo)**
   - Tabelle Supabase usate in app (da grep `supabase.from` / `.from('...')`):  
     `profiles`, `user_clues`, `user_buzz_counter`, `user_notifications`, `subscriptions`, `user_payment_methods`, `user_cashback_wallet`, `buzz_grants`, `user_mission_status`, `marker_claims`, `marker_rewards`, `avatars` (storage), `panel_logs`, ecc.
   - Definire lista ufficiale “export GDPR” (profilo, progress, clues, acquisti, preferenze, ecc.) e documentarla; per file (avatar, ecc.) decidere se includere URL o copia binaria e se usare ZIP.

4. **iOS**
   - Download “browser-style” (Blob + link) può funzionare in WKWebView ma non sempre apre correttamente la condivisione/salvataggio su dispositivo. Per UX robusta: integrare `@capacitor/filesystem` e `@capacitor/share` per salvare il file e aprirlo con il sheet di condivisione iOS.

Non esistono in repo endpoint di export o admin riutilizzabili per “download my data”; va implementata ex novo l’Edge Function e il flusso client sopra.

---

## 5) Complessità: **MEDIA**

- **Motivazione:**
  - **Tabelle:** molte (10+ tra profilo, missioni, buzz, notifiche, pagamenti, rewards, wallet, ecc.), non 1–3.
  - **File allegati:** sì (avatar in storage) → export completo richiede gestione storage e decisione formato (JSON + URL vs ZIP con binari).
  - **Async job:** per export molto grandi si potrebbe usare un job in coda; per un primo MVP “tutto in una risposta” o “URL firmato a file già generato” è fattibile senza job asincroni complessi → non obbligatorio un sistema di job pesante, ma va considerato se il payload cresce.
- Quindi: non BASSA (più di poche tabelle, presenza storage), non ALTA (non richiesto fin da subito un sistema di export asincrono multi-step). **MEDIA** è una stima conservativa.

---

## 6) Compliance: possiamo rimuoverlo? (evidence-based, non parere legale)

### GDPR

- **Canale alternativo:** sì. In app sono presenti:
  - **Contact Support:** modale Legal (`LegalSectionContent.tsx`) con `mailto:contact@m1ssion.com?subject=M1SSION%20Support` (e in altri punti `support@m1ssion.com`, `contact@m1ssion.com`).
  - **Privacy:** Norah KB e pagina Privacy citano `privacy@m1ssion.app` per domande privacy; pagina Privacy (`Privacy.tsx`) mostra `privacy@m1ssion.app`.
- **Rischio:** un CTA “Download My Data” visibile ma non funzionante è peggio di non averlo: l’utente si aspetta un’azione che non avviene (promessa non mantenuta, possibile richiamo in contesto privacy). Meglio o implementarlo davvero o rimuoverlo/rimpiazzarlo con un’azione onesta (es. “Request my data” che apre mailto a privacy/support con richiesta di export).
- **Se lo si rimuove:** resterebbero come meccanismi per “accesso ai dati” i link/CTA a Contact Support e l’indirizzo privacy già presenti in Legal/Privacy; andrebbe verificato che siano ben visibili e che la privacy policy descriva come richiedere l’accesso ai dati (es. via email). La conformità finale va validata con consulenza legale.

### Apple

- Apple non richiede obbligatoriamente un pulsante “download my data” in-app, ma penalizza UX ingannevole o feature che sembrano funzionare e non fanno nulla.
- **Raccomandazione tecnica:** se il CTA non viene implementato, è preferibile rimuoverlo o sostituirlo con un’azione chiara (es. “Request my data” → mailto) per evitare recensioni/rigetti per “funzionalità fuorviante”. Nessuna modifica è stata applicata in questo report (NO PATCH).

---

## 7) Rischio compliance: lasciato non funzionante vs rimosso

- **Lasciato non funzionante:** rischio maggiore (promessa “Download My Data” non mantenuta, possibile richiamo in contesto privacy/Apple).
- **Rimosso (o convertito in “Request my data” con mailto):** rischio minore, a patto che resti un canale chiaro per richiedere i dati (contact/privacy email) e che la privacy policy sia allineata. La decisione finale va presa con legal/compliance.

---

## 8) Conferma: nessuna modifica effettuata

- **Nessun file è stato modificato.**  
- Report basato solo su: lettura codice, grep, analisi di `PrivacySectionContent.tsx`, edge functions, pattern di download (Blob/URL/createObjectURL), e canali di contact/privacy già presenti in repo.

---

*Firma: Lovable Agent JLENIA*
