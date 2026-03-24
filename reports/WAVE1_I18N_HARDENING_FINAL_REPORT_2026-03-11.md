# WAVE 1 i18n HARDENING SAFE — REPORT FINALE

**Data:** 2026-03-11  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Ambiente:** App nativa iOS wrappata (Capacitor WKWebView).  
**Scope:** Solo Wave 1 — Shell + Language UI (LanguageSettings + SettingsPage allineamento lingue).

---

## 1. Safety

| Elemento | Valore |
|----------|--------|
| **Branch iniziale** | `feat/pe-global-fullscreen-reward` |
| **HEAD iniziale** | `7012170a1132f77a66f7359d69b9be6cd97e703b` |
| **Safety branch** | `safety/i18n-wave1-pre` (creato/verificato presente) |
| **Safety tag** | `safety/i18n-wave1-pre` (creato/verificato presente) |

**Comandi rollback (in caso di problemi):**
```bash
git checkout feat/pe-global-fullscreen-reward
git reset --hard 7012170a1132f77a66f7359d69b9be6cd97e703b
```
Oppure per tornare al tag di safety prima di eventuali altri commit:
```bash
git checkout safety/i18n-wave1-pre
```

---

## 2. Verifica pre-patch

### File analizzati

- **src/pages/LanguageSettings.tsx** — Pagina Impostazioni Lingua: titolo, label "Seleziona Lingua", pulsante "Salva", toast al cambio lingua, nomi lingue (Italiano, English, Français) e oggetto `texts` hardcoded.
- **src/pages/SettingsPage.tsx** — Select lingua in sezione Applicazione: presenti quattro `SelectItem` (it, en, fr, **de**). In `src/i18n/i18n.ts` `SUPPORTED = ['en','it','fr']` → **de** non supportato.
- **src/locales/{en,it,fr}/common.json** — Verificato: chiave `language` esistente; nessuna chiave per language_settings_* o language_updated_toast_* o lang_name_*.

### Hardcoded trovati (LanguageSettings)

- Titolo pagina: da oggetto `texts` (it/en/fr).
- Label "Seleziona Lingua": da `texts.select`.
- Pulsante "Salva Impostazioni": da `texts.save`.
- Toast al cambio lingua: `title` e `description` con ternari it/fr/en e `selectedLang.name`.
- Nomi lingue in elenco: `language.name` (Italiano, English, Français).

### Intervento minimo scelto

1. **LanguageSettings:** Sostituire tutti i testi con `t(...)`. Aggiungere in common (en, it, fr) le chiavi: `language_settings_title`, `language_settings_select`, `language_settings_save`, `language_updated_toast_title`, `language_updated_toast_description` (con `{{langName}}`), `lang_name_it`, `lang_name_en`, `lang_name_fr`. Rimuovere l’oggetto `texts` e l’uso di `language.name`; usare `t(\`lang_name_${language.code}\`)` per i nomi. Logica (setLocale, getLocale, handleLanguageChange, handleSave, useEffect) **invariata**.
2. **SettingsPage:** Rimuovere la sola riga `<SelectItem value="de">Deutsch</SelectItem>`. Nessuna modifica a logica, storage o altre sezioni.
3. **Shell:** Nessun intervento (nessuna label shell strettamente in scope Wave 1 trovata da modificare).

### Blast radius

- **Modificati:** solo LanguageSettings.tsx, SettingsPage.tsx, e i tre file common.json (en, it, fr).
- **Non toccati:** auth, login, logout, cancellazione account, IAP, BUZZ, BUZZ MAP, push, routing, intl/translations, Landing, CookieBanner, i18n.ts (nessun refactor).
- **Valutazione:** blast radius **basso**. Conferma: **procedere**.

---

## 3. File realmente modificati

| File | Motivo |
|------|--------|
| **src/pages/LanguageSettings.tsx** | Titoli, label, pulsante e toast portati su `t(...)`; rimosso oggetto `texts` e proprietà `name` dall’array `languages`; logica lingua invariata. |
| **src/pages/SettingsPage.tsx** | Rimossa dalla UI l’opzione `Deutsch` (value `de`) dalla Select lingua; lasciate solo it, en, fr. |
| **src/locales/en/common.json** | Aggiunte 8 chiavi: `language_settings_title`, `language_settings_select`, `language_settings_save`, `language_updated_toast_title`, `language_updated_toast_description`, `lang_name_it`, `lang_name_en`, `lang_name_fr`. |
| **src/locales/it/common.json** | Stesse 8 chiavi con valori in italiano. |
| **src/locales/fr/common.json** | Stesse 8 chiavi con valori in francese. |

---

## 4. Chiavi i18n

**Chiavi aggiunte** (in tutti e tre i file common):

| Chiave | en | it | fr |
|--------|----|----|-----|
| `language_settings_title` | Language Settings | Impostazioni Lingua | Paramètres de Langue |
| `language_settings_select` | Select Language | Seleziona Lingua | Sélectionner la Langue |
| `language_settings_save` | Save Settings | Salva Impostazioni | Enregistrer |
| `language_updated_toast_title` | Language Updated | Lingua Aggiornata | Langue Mise à Jour |
| `language_updated_toast_description` | App language has been changed to {{langName}}. | La lingua dell'app è stata cambiata in {{langName}}. | La langue de l'app a été changée en {{langName}}. |
| `lang_name_it` | Italiano | Italiano | Italiano |
| `lang_name_en` | English | English | English |
| `lang_name_fr` | Français | Français | Français |

**Conferma:** Le 8 chiavi sono presenti in en, it e fr. Nessuna chiave rimossa o rinominata. Interpolazione `{{langName}}` usata solo in `language_updated_toast_description`.

---

## 5. Verifica post-patch

- **Import:** Nessun import rotto; LanguageSettings usa `useTranslation` e `getLocale`/`setLocale` da i18n come prima.
- **Chiavi:** Tutte le chiavi usate esistono in common (en, it, fr).
- **TypeScript:** Nessun errore; `languages` è `{ code, flag }[]`; `t(\`lang_name_${language.code}\`)` e `t('language_updated_toast_description', { langName })` sono validi.
- **Lint:** Nessun errore lint bloccante sui file toccati (verificato con read_lints).
- **Rimozione de:** In SettingsPage la Select contiene solo tre `SelectItem` (it, en, fr). Opzione Deutsch/de **rimossa**.
- **Scope:** Modificati solo i 5 file sopra; nessun altro file toccato.

---

## 6. Build

- **Comando:** `npm run build`
- **Esito:** **OK** (exit code 0). Build completato in ~1m 41s (output: `✓ built in 1m 41s`).

---

## 7. Capacitor sync

- **Comando:** `npx cap sync ios`
- **Esito:** **OK**. Eseguito con successo: "Copying web assets from dist to ios/App/App/public", "Creating capacitor.config.json in ios/App/App", "copy ios", "Updating iOS plugins" (checkmarks presenti nell’output).

---

## 8. Rischio regressione

- **Valutazione:** Bassa. Le modifiche sono limitate a testi e a una voce in meno nella Select; la logica di cambio lingua (setLocale, getLocale, useEffect, handleSave, navigazione) non è stata toccata. Utenti che avevano "de" salvato in settings.app.language potrebbero avere un valore non più selezionabile in UI (comportamento preesistente: de non era supportato da i18n); non è stato introdotto alcun migrazione o reset per non uscire dallo scope.
- **Punti sensibili:** Nessuno aggiunto. LanguageSettings e SettingsPage non toccano auth, BUZZ, IAP, push, cancellazione account.

---

## 9. GO / NO-GO per Wave 2

**GO.**

- Struttura lingua/UI Wave 1 è stata messa in sicurezza (titoli, label, toast su common; UI allineata alle sole lingue supportate it/en/fr).
- Scope rispettato: solo LanguageSettings, SettingsPage e chiavi common; nessun tocco a auth, BUZZ, IAP, routing, push, delete account, intl/Landing.
- Build OK, cap sync ios OK.
- Nessun segnale che renda pericoloso procedere con Wave 2 (Auth/Login/Register): nessuna modifica a flussi critici, nessun refactor strutturale, patch minima e reversibile.

---

## 10. Step successivo consigliato

- **Cosa fare subito dopo:** (1) Commit delle modifiche Wave 1 su un branch dedicato (es. `feat/i18n-wave1-hardening`) se si adotta un workflow con branch; (2) QA manuale su dispositivo iOS: aprire Impostazioni Lingua, cambiare lingua, verificare titolo/label/pulsante e toast; aprire Settings (pagina) e verificare che la Select lingua mostri solo Italiano, English, Français; (3) Pianificare Wave 2 (Auth/Login/Register) secondo il piano di hardening (solo testi su common, nessuna modifica a logica auth).
- **Cosa NON fare ancora:** Non toccare Login.tsx, Auth.tsx, StandardLoginForm, Register, flussi IAP, BUZZ, BUZZ MAP, push, cancellazione account, routing; non aggiungere spagnolo/portoghese/tedesco; non modificare `src/i18n/i18n.ts` (SUPPORTED, detection, storage) finché non è previsto dal piano.

---

**Fine report. Wave 1 completata; verdetto: GO per Wave 2.**

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
