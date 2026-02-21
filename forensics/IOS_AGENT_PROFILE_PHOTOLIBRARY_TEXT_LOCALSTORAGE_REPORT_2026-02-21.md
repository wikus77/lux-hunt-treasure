# iOS Agent Profile — Photo Library + Grey Text + localStorage Report
**Date:** 2026-02-21  
**Branch:** `fix/ios-agent-profile-avatar-hit-test`  
**Rollback tag:** `safety/ios-agent-profile-avatar-photolibrary-text-before-20260221_143000`

---

## 1. Root cause (forensics)

- **Photo Library non salva / non si vede:** Su iOS, la Photo Library può restituire file HEIC/HEIF. WKWebView e molti viewer non renderizzano HEIC; l’upload a Supabase poteva andare a buon fine ma l’URL puntava a un file HEIC non mostrato, oppure l’upload stesso poteva fallire/essere incoerente. **Soluzione:** normalizzazione lato client a JPEG (createImageBitmap → canvas → toBlob image/jpeg) prima dell’upload; path e contentType fissi a `.jpg` / `image/jpeg`. Se createImageBitmap fallisce (HEIC non supportato), fallback UX: toast “Formato non supportato, scegli JPG/PNG” + log `[AvatarAsset] heic_decode_failed` senza crash.
- **Error reading localStorage key 'profileImage':** `useProfileImage` usava `useLocalStorage('profileImage', null)`, che fa `JSON.parse(item)` in lettura. Diversi punti (ProfileInfo, useProfileRealtime, ecc.) scrivono con `localStorage.setItem('profileImage', url)` in **plain string**. Alla successiva lettura, `JSON.parse("https://...")` falliva (stringa non quotata) e generava l’errore in console. **Soluzione:** in `useProfileImage` non usare più `useLocalStorage` per `profileImage`; introdotti `safeGetProfileImage()` e `safeSetProfileImage()` che leggono/scrivono la chiave come **plain string** (nessun JSON); in caso di valore non valido/corrotto: rimozione + log `[AvatarSync] corrupted_value_removed`.
- **Testi grigi in edit mode:** Già parzialmente corretti; completato con `caret-white` e `disabled:opacity-100 disabled:text-white` sui campi edit in ProfileInfo per massima leggibilità e coerenza nel glass context.

---

## 2. Rollback

**Tag:** `safety/ios-agent-profile-avatar-photolibrary-text-before-20260221_143000`

**Comandi pre-patch (già eseguiti):**
```bash
git add -A
git commit -m "chore(safety): snapshot before avatar photolibrary + text fixes" || true
git tag safety/ios-agent-profile-avatar-photolibrary-text-before-20260221_143000
git push --tags || true
```

**Ripristino:**
```bash
git fetch --tags
git checkout fix/ios-agent-profile-avatar-hit-test
git reset --hard safety/ios-agent-profile-avatar-photolibrary-text-before-20260221_143000
# Oppure restore solo i file toccati:
# git checkout safety/ios-agent-profile-avatar-photolibrary-text-before-20260221_143000 -- src/components/profile/ProfileInfo.tsx src/hooks/useProfileImage.ts
```

---

## 3. Patch applicate (scope)

### 3.1 `src/hooks/useProfileImage.ts`
- Rimozione uso di `useLocalStorage` per `profileImage`.
- `safeGetProfileImage()`: legge `profileImage` come plain string; se valore non è un URL valido (o JSON legacy) lo rimuove e logga `[AvatarSync] corrupted_value_removed`; in errore restituisce `null`.
- `safeSetProfileImage(value)`: scrive la URL come plain string (no JSON); in catch logga `[AvatarSync] localStorage_write_failed`.
- Stato `profileImage` inizializzato con `safeGetProfileImage()`; setter aggiorna stato e chiama `safeSetProfileImage`. Export di `safeSetProfileImage` per uso in ProfileInfo.

### 3.2 `src/components/profile/ProfileInfo.tsx`
- **Normalizzazione HEIC:** `normalizeAvatarFile(file)`: se tipo/estensione HEIC/HEIF, tenta createImageBitmap → canvas → toBlob('image/jpeg', 0.9) → nuovo `File` `.jpg`; se fallisce restituisce `null` (toast “Formato non supportato, scegli JPG/PNG” + log `[AvatarAsset] heic_decode_failed`).
- **Avatar flow:** Upload sempre con path `avatar_<ts>.jpg` e `contentType: 'image/jpeg'`. Log forensi: `[AvatarPicker] source=file ...`, `[AvatarAsset] normalized_to=image/jpeg` (se normalizzato), `[AvatarUpload] start/ok`, `[AvatarProfile] update start/ok`, `[AvatarSync] localStorage ok` o `localStorage_write_failed`, `[AvatarRender] avatar_url updated`.
- **localStorage:** Dopo update profilo si chiama `safeSetProfileImage(publicUrl.publicUrl)` in try/catch (no blocco upload se write fallisce).
- **Edit mode:** Aggiunto `caret-white` e `disabled:opacity-100 disabled:text-white` a Input e Textarea del blocco edit.

---

## 4. Build e test

```bash
npm run build
npx cap sync ios
```

**Checklist device (iPhone, Xcode):**
- Edit mode: campi nome, codice, titolo, bio leggibili (testo bianco, placeholder leggibile).
- Take Photo: avatar si aggiorna e persiste dopo kill app.
- Photo Library: scegliere una foto → avatar si aggiorna e persiste dopo kill app; in log: `[AvatarPicker] source=file`, eventuale `[AvatarAsset] normalized_to=image/jpeg`, `[AvatarUpload] ok`, `[AvatarProfile] update ok`, `[AvatarSync] localStorage ok`.
- Nessuna regressione su Home/Map/Buzz/IAP.
- Console senza “Error reading localStorage key 'profileImage'”.

---

## 5. File modificati

- `src/hooks/useProfileImage.ts` — safe get/set profileImage, niente useLocalStorage per questa chiave.
- `src/components/profile/ProfileInfo.tsx` — normalizzazione HEIC→JPEG, log forensi, safeSetProfileImage, fix UI edit mode.

Nessuna modifica a: wrapper iOS, entitlements, Capacitor, auth globale, Supabase client, DB/RLS.
