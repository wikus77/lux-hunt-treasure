# 🔄 M1SSION™ — Supabase Migration Guide (Post-Remix)

## 📌 Overview

Questo progetto M1SSION™ è stato preparato per la disconnessione dal **Lovable Cloud** e il rebind a un **Supabase personale**.

Il codice è ora **completamente indipendente** dalle credenziali hardcoded e utilizza **solo variabili d'ambiente**, che verranno automaticamente popolate da Lovable dopo il remix e la riconnessione.

---

## ✅ Stato Attuale

### File Modificati
1. **`src/lib/supabase/config.ts`**
   - ✅ Ora usa `import.meta.env.VITE_SUPABASE_URL`
   - ✅ Ora usa `import.meta.env.VITE_SUPABASE_ANON_KEY`
   - ✅ Auto-estrae `projectRef` dall'URL
   - ✅ Genera automaticamente `functionsUrl`

2. **`src/pages/dev/PushTest.tsx`**
   - ✅ Rimosso URL hardcoded
   - ✅ Usa `import.meta.env.VITE_SUPABASE_URL`

### File NON Modificati (per design)
- ✅ **`src/integrations/supabase/client.ts`**: Auto-generato da Lovable (verrà rigenerato dopo il remix)
- ✅ **Push System**: Intatto (Guard-compliant)
- ✅ **Logiche BUZZ/MAP**: Invariate
- ✅ **Stripe/Pagamenti**: Invariate
- ✅ **Routing/UX**: Invariate

---

## 🚀 Procedura di Migrazione

### Step 1: Disabilita Lovable Cloud
1. Vai in **Settings → Tools → Cloud**
2. Clicca su **"Disable Cloud"**

### Step 2: Remix del Progetto
1. Vai in **Settings → Project**
2. Clicca su **"Remix this project"**
3. Aspetta che il progetto venga duplicato

### Step 3: Connetti il tuo Supabase
1. Nel nuovo progetto remixato, vai in **Settings → Tools → Supabase**
2. Inserisci le credenziali del **tuo Supabase personale**:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **Anon Key**: La tua chiave pubblica

### Step 4: Verifica Automatica
Le seguenti variabili d'ambiente verranno **automaticamente popolate da Lovable**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (o `VITE_SUPABASE_PUBLISHABLE_KEY`)
- `VITE_SUPABASE_PROJECT_ID`

---

## 🧪 Verifica Post-Migrazione

### Test Automatici (Console Browser)
Apri la **Developer Console** (F12) e verifica:

```
✅ [SUPABASE-CONFIG] Configuration loaded: { projectRef: 'xxx', url: 'https://...' }
```

Se vedi errori come:
```
❌ [SUPABASE-CONFIG] Missing VITE_SUPABASE_URL
```
→ Significa che le env non sono state popolate. Ricontrolla la connessione Supabase.

### Test Funzionali

#### 1. **Test Autenticazione**
- Vai su `/login`
- Prova a fare login/signup
- ✅ Se funziona → Supabase client connesso

#### 2. **Test Database**
- Vai su `/profile` o qualsiasi pagina che legge dal DB
- ✅ Se vedi i dati → Database connesso

#### 3. **Test Edge Functions**
- Vai su `/dev/push-test` (solo admin)
- Prova a inviare una notifica di test
- ✅ Se funziona → Edge functions connesse

#### 4. **Test Diagnostics**
- Vai su `/diag-supabase`
- Verifica che:
  - **Client Instances Count** = 1 (singleton pattern)
  - **Environment** = production/development
  - **RPC Health** = OK

---

## 🛠️ Troubleshooting

### Problema: "Supabase client not initialized"
**Causa**: Env variables non popolate  
**Soluzione**:
1. Verifica in **Settings → Tools → Supabase** che la connessione sia attiva
2. Prova a riconnettere il Supabase
3. Rebuilda il progetto (Lovable lo fa automaticamente)

### Problema: "Multiple Supabase instances detected"
**Causa**: Re-import accidentali del client  
**Soluzione**:
1. Vai su `/diag-supabase`
2. Verifica lo stack trace
3. Segnala il file problematico (se necessario)

### Problema: "RPC error in health check"
**Causa**: Database schema non allineato  
**Soluzione**:
1. Verifica che il tuo Supabase abbia tutte le tabelle necessarie
2. Esegui le migrazioni (`supabase/migrations/`) sul tuo DB
3. Riavvia il progetto

---

## 📊 Checklist Finale

Prima di considerare la migrazione completa, verifica:

- [ ] Login/Signup funzionante
- [ ] Profilo utente visibile
- [ ] BUZZ attivabile
- [ ] BUZZ MAP attivabile
- [ ] Notifiche push funzionanti (se configurate)
- [ ] Pagamenti Stripe funzionanti
- [ ] Console senza errori Supabase
- [ ] `/diag-supabase` mostra count=1

---

## 🆘 Supporto

Se riscontri problemi durante la migrazione:

1. **Verifica le env**: Apri Console (F12) e cerca i log `[SUPABASE-CONFIG]`
2. **Controlla lo schema DB**: Assicurati che il tuo Supabase abbia tutte le tabelle
3. **Contatta il team**: Se persiste, segnala il problema con:
   - Screenshot della console
   - URL della pagina problematica
   - Messaggio di errore completo

---

## ✨ Funzionalità Preservate

Dopo la migrazione, **tutto continuerà a funzionare esattamente come prima**:

- ✅ Sistema BUZZ e BUZZ MAP (geolocalizzazione, prezzi, M1U)
- ✅ Notifiche Push (Web Push, FCM, APNS)
- ✅ Pagamenti Stripe (subscription, checkout)
- ✅ Ranking e Pulse Energy
- ✅ Battle System
- ✅ Referral System
- ✅ Admin Panel

**ZERO cambiamenti alla business logic!**

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
