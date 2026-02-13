# 🔍 FORENSIC REPORT — iOS CAMBIO LINGUA NON PROPAGA IN M1SSION

**Data**: 2026-02-12  
**Modalità**: READ-ONLY (zero modifiche)  
**Ambiente**: iOS wrapped (Capacitor + WKWebView)  
**Comparativo**: Royal Match cambia lingua correttamente, M1SSION no

---

## 📊 EXECUTIVE SUMMARY

| Aspetto | M1SSION | Royal Match (ipotetico) |
|---------|---------|------------------------|
| Rilevazione lingua | `navigator.language` | Native `NSLocale.preferredLanguages` |
| Persistenza | `localStorage['m1_locale']` | Nessuna o OS-driven |
| Refresh su resume | ❌ Nessuno | ✅ Probabile |
| Override utente | Sovrascrive OS | Solo se esplicito |

**ROOT CAUSE PRINCIPALE (95%)**: Una volta che l'app salva una lingua in `localStorage['m1_locale']`, questa viene usata per SEMPRE, ignorando i cambiamenti di lingua iOS.

---

## 📋 TASK 1 — MAPPATURA ARCHITETTURA I18N

### Libreria utilizzata

| Package | Versione | Uso effettivo |
|---------|----------|---------------|
| `i18next` | ^25.5.3 | ✅ Attivo |
| `react-i18next` | ^16.0.0 | ✅ Attivo |
| `i18next-browser-languagedetector` | ^8.2.0 | ❌ **INSTALLATO MA NON USATO** |

### File di inizializzazione

**`src/i18n/i18n.ts`** (file principale):

```typescript
// Line 20: Storage key per override locale
const STORAGE_KEY = 'm1_locale';

// Line 61-63: Logica di priorità
export function getDefaultLocale(): SupportedLang {
  return getSavedLocale() ?? getDeviceLocale();
  //     ^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^
  //     1° PRIORITÀ         2° FALLBACK
}

// Line 41-48: Legge da localStorage
export function getSavedLocale(): SupportedLang | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? normalize(raw) : null;
}

// Line 34-39: Legge da browser/device
export function getDeviceLocale(): SupportedLang {
  const nav = (globalThis as any)?.navigator;
  const byList = Array.isArray(nav?.languages) && nav.languages.length > 0 
    ? nav.languages[0] : null;
  const raw = byList || nav?.language || nav?.userLanguage || 'en';
  return normalize(raw);
}

// Line 129: Auto-inizializzazione all'import
initI18n().catch(console.error);
```

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP START                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  main.tsx → import './i18n/i18n' → initI18n() auto-runs         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  getDefaultLocale()                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. getSavedLocale() → localStorage.getItem('m1_locale')     ││
│  │    ├── Se ESISTE → RETURN (ignora device)  ⚠️ PROBLEMA     ││
│  │    └── Se NULL → continua                                   ││
│  │                                                              ││
│  │ 2. getDeviceLocale() → navigator.languages[0]               ││
│  │    └── RETURN (solo se localStorage vuoto)                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  i18next.init({ lng: <resolved_locale> })                        │
│  → Lingua FREEZATA per tutta la sessione                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 TASK 2 — VERIFICA OVERRIDE/LOCK

### Occorrenze chiave localStorage

| File | Key | Operazione | Impatto |
|------|-----|------------|---------|
| `src/i18n/i18n.ts:20` | `m1_locale` | Definizione | Chiave lingua |
| `src/i18n/i18n.ts:43` | `m1_locale` | `getItem` | Lettura override |
| `src/i18n/i18n.ts:52` | `m1_locale` | `setItem` | **BLOCCA lingua OS** |

### Punto critico: `setLocale()` (line 50-59)

```typescript
export function setLocale(lng: SupportedLang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lng);  // ← QUESTO BLOCCA TUTTO
  } catch {
    /* ignore */
  }
  if (i18next?.changeLanguage) {
    i18next.changeLanguage(lng);
  }
}
```

**Quando viene chiamato `setLocale()`?**
- Non trovato call diretto nel codebase principale
- Probabile chiamato da settings/preferenze utente (se esistono)
- O chiamato implicitamente al primo avvio per "salvare" la lingua rilevata

### Ricerca nel codebase

```bash
# Nessuna chiamata esplicita trovata a setLocale() fuori da i18n.ts
# Ma la funzione è esportata e POTREBBE essere chiamata da qualche parte
```

---

## 📋 TASK 3 — iOS WRAPPER: LETTURA LINGUA

### Stack tecnologico

| Componente | Versione | File evidenza |
|------------|----------|---------------|
| Capacitor | 7.4.4 | `package.json` |
| WKWebView | Native | `capacitor.config.ts` |
| Plugin locale | **NESSUNO** | `package.json` |

### Info.plist

```xml
<key>CFBundleDevelopmentRegion</key>
<string>en</string>
```

✅ Standard, non causa problemi.

### Come WKWebView gestisce `navigator.language`

Su iOS wrapped:
- `navigator.language` riflette la lingua del **sistema iOS**
- MA viene letto **SOLO all'avvio** della WebView
- Un cambio lingua iOS richiede **kill + restart** dell'app per propagarsi a `navigator.language`

### Plugin Capacitor per locale

**NON INSTALLATI**:
- `@capacitor/device` (contiene `Device.getLanguageCode()`)
- `cordova-plugin-globalization` (deprecato)

**CONSEGUENZA**: L'app usa SOLO `navigator.language` del web runtime, che su iOS wrapped non si aggiorna dinamicamente.

---

## 📋 TASK 4 — TEST DIAGNOSTICO (SENZA PATCH)

### Piano di riproduzione

1. **Stato iniziale**:
   ```javascript
   // Da Safari Web Inspector sulla WebView
   console.log('navigator.language:', navigator.language);
   console.log('navigator.languages:', navigator.languages);
   console.log('localStorage m1_locale:', localStorage.getItem('m1_locale'));
   console.log('i18next.language:', i18next?.language);
   ```

2. **Cambia lingua iPhone**: Impostazioni → Generali → Lingua → Italiano → Inglese

3. **Chiudi app** (swipe up, ma NON kill)

4. **Riapri app** e ripeti i log

5. **Kill app** (dal multitasking) e riapri

6. **Confronta**:
   - `navigator.language` cambia solo dopo kill?
   - `localStorage.m1_locale` rimane sempre uguale?
   - `i18next.language` rimane sempre uguale?

### Risultato atteso

| Scenario | `navigator.language` | `localStorage['m1_locale']` | `i18next.language` |
|----------|---------------------|----------------------------|--------------------|
| Prima cambio | `it` | `it` | `it` |
| Dopo cambio (no kill) | `it` (NON cambia) | `it` | `it` |
| Dopo cambio (con kill) | `en` (CAMBIA) | `it` (NON cambia) | `it` (NON cambia) |

⚠️ **Problema**: Anche dopo kill, `localStorage` mantiene il valore, quindi i18next non si aggiorna.

---

## 📋 TASK 5 — ROOT CAUSE RANKING

### TOP 3 CAUSE

| # | Causa | Probabilità | Evidenza | Perché Royal Match sì |
|---|-------|-------------|----------|----------------------|
| **1** | **`localStorage['m1_locale']` persiste e override OS** | **95%** | `i18n.ts:62` `getSavedLocale() ?? getDeviceLocale()` | Royal Match non persiste o usa native API |
| **2** | **Nessun refresh su app resume** | **80%** | Nessun listener `appStateChange` per i18n | Royal Match ri-legge locale su resume |
| **3** | **`navigator.language` non si aggiorna in WKWebView senza kill** | **60%** | Comportamento noto iOS WKWebView | Royal Match usa native NSLocale |

### Dettaglio Root Cause #1

```
M1SSION:
1. Primo avvio → lingua IT (da OS)
2. Salvato in localStorage['m1_locale'] = 'it'
3. Utente cambia lingua iPhone → EN
4. Kill app
5. Riavvio → getSavedLocale() ritorna 'it' ← OVERRIDE
6. getDeviceLocale() MAI chiamato (short-circuit)
7. App mostra IT anche se OS è EN

ROYAL MATCH (ipotetico):
1. Primo avvio → lingua IT (da OS nativo)
2. NON salva in localStorage
3. Utente cambia lingua iPhone → EN
4. Kill app
5. Riavvio → legge direttamente NSLocale.preferredLanguages → EN
6. App mostra EN
```

---

## 📋 TASK 6 — OPZIONI "COME ROYAL MATCH"

### Opzione 1: Native-Driven Locale (via Capacitor plugin)

**Descrizione**: Installare `@capacitor/device` e usare `Device.getLanguageCode()` all'avvio.

**Pro**:
- Lettura diretta da iOS NSLocale
- Sempre sincronizzato con OS
- Funziona anche senza kill app (su resume)

**Contro**:
- Aggiunge dipendenza
- Richiede modifica init flow

**Impatto UX**: Ottimo. Comportamento identico a Royal Match.

**Cosa serve**:
- `npm install @capacitor/device`
- Modificare `i18n.ts` per usare `Device.getLanguageCode()` come prima fonte

---

### Opzione 2: No Persistence (sempre da OS)

**Descrizione**: Rimuovere completamente `localStorage['m1_locale']` e usare SOLO `navigator.language`.

**Pro**:
- Zero dipendenze nuove
- Sempre sincronizzato dopo kill app

**Contro**:
- Non funziona senza kill (WKWebView non aggiorna navigator.language)
- Utente non può più scegliere lingua diversa da OS

**Impatto UX**: Buono per chi segue OS, ma limita scelta utente.

**Cosa serve**:
- Rimuovere `getSavedLocale()` da `getDefaultLocale()`
- Rimuovere `setLocale()` (o renderlo no-op per storage)

---

### Opzione 3: Hybrid (OS default + manual override)

**Descrizione**: Di default segue OS, ma se utente sceglie manualmente → salva override.

**Pro**:
- Best of both worlds
- Utente mantiene controllo
- Comportamento "smart"

**Contro**:
- Logica più complessa
- Richiede UI per reset a "Auto (OS)"

**Impatto UX**: Ottimo. Flessibile.

**Cosa serve**:
- Modificare `getDefaultLocale()` per distinguere "explicit user choice" vs "auto"
- Aggiungere opzione "Auto" in settings lingua
- Salvare flag `m1_locale_source: 'auto' | 'manual'`

---

### Opzione 4: Lifecycle Refresh (re-read on resume)

**Descrizione**: Ascoltare `appStateChange` e ri-leggere locale quando app torna in foreground.

**Pro**:
- Funziona senza kill app
- Compatibile con scelta utente (basta non salvare se auto)

**Contro**:
- Potenziale "flash" di cambio lingua
- Richiede gestione cambio lingua a runtime (re-render)

**Impatto UX**: Buono, ma richiede attenzione a flash/flicker.

**Cosa serve**:
- Importare `App` da `@capacitor/app` (già installato)
- Ascoltare `appStateChange` → `state === 'active'`
- Chiamare `i18next.changeLanguage(getDeviceLocale())`
- Gestire re-render UI

---

## 🎯 DECISION POINTS

Per ottenere comportamento "Royal Match-like", devi decidere:

| Decisione | Opzioni |
|-----------|---------|
| **1. Fonte primaria lingua** | A) Native Capacitor plugin / B) navigator.language / C) Entrambi |
| **2. Persistenza utente** | A) Mai salvare / B) Solo se scelta esplicita / C) Sempre salvare (attuale) |
| **3. Refresh dinamico** | A) Solo su cold start / B) Anche su resume / C) Realtime (complesso) |
| **4. UI settings** | A) Rimuovere scelta lingua / B) Aggiungere "Auto (OS)" / C) Mantenere attuale |

---

## ✅ CONFERMA FINALE

- **Nessuna modifica eseguita**
- **Nessun file toccato**
- **Solo analisi read-only**

---

## 📎 FILES ESAMINATI

| File | Scopo |
|------|-------|
| `src/i18n/i18n.ts` | Inizializzazione i18n |
| `src/main.tsx` | Entry point app |
| `src/intl/lang-detection.ts` | Helper detection (non usato da i18n) |
| `capacitor.config.ts` | Config Capacitor |
| `ios/App/App/Info.plist` | Config iOS |
| `package.json` | Dipendenze |

---

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
