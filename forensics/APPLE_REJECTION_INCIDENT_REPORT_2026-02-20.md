# APPLE REJECTION INCIDENT REPORT — 2026-02-20 (READ-ONLY FORENSICS)

**Device:** iPad Air 11" (M3), iPadOS 26.3  
**App:** M1SSION™ (Capacitor / WKWebView)  
**Scope:** Analisi read-only. Nessuna modifica a codice, config, plist o build.

---

## 1. SUMMARY (3 PUNTI APPLE)

| # | Punto Apple | Stato | Conclusione breve |
|---|-------------|--------|--------------------|
| 1 | **Guideline 2.1 Crash** — "Tapped to open the camera" | **EVIDENZA** | Più punti aprono camera/picker; un input usa `capture="environment"` (camera esplicita). Info.plist ha le chiavi. Nessun crash log in repo. Cause probabili: WebKit/file input su iPad, o `getUserMedia` in Privacy Permissions. |
| 2 | **Guideline 2.1 Bug** — "buttons in the account section were unresponsive" | **EVIDENZA** | In **Privacy Permissions** (`/settings/privacy-permissions`) il bottone **"Elimina Account"** e il bottone **"Esporta Dati"** non hanno `onClick` → non fanno nulla. Altri pattern (overlay, z-index) possibili su iPad. |
| 3 | **Guideline 5.1.1(v)** — Account creation senza account deletion | **PARZIALE** | UI "Elimina account" **esiste** in Settings → Legale (`/settings/legal`) con flusso conferma + `handleDeleteAccount`. Il flusso **non** elimina l’utente da **Supabase Auth** (solo tabelle app + signOut): l’utente può ri-accedere. Nessun link in-app alla cancellazione “completa” (auth). |

---

## 2. PHASE 0 — INVENTORY

### 2.1 Stack wrapper e plugin

| File | Funzione | Note |
|------|----------|------|
| `capacitor.config.ts` | Config Capacitor | appId `eu.m1ssion.app`, webDir `dist`, plugin solo PushNotifications. **Nessun** `@capacitor/camera` in `package.json`. |
| `ios/App/App/Info.plist` | Permessi iOS | Vedi Phase 1B. |
| `package.json` | Dipendenze | `@capacitor/ios`, `@capacitor/core`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/push-notifications`, `@capacitor/status-bar`. **Nessun** plugin Camera/Photo. |

**Conclusione:** L’apertura camera non passa da Capacitor Camera API; avviene tramite **HTML `<input type="file">`** o **`navigator.mediaDevices.getUserMedia`**.

### 2.2 Sezione Account / Settings

| Route | Pagina/Componente | Contenuto / Bottoni |
|-------|-------------------|----------------------|
| `/settings` | `SettingsPage.tsx` | Lista card: Profilo Agente, Sicurezza, Missione, Notifiche, Privacy, Metodi di Pagamento, Legale, Info App. Tap → `handleSectionChange` → navigate a `/settings/<id>`. |
| `/settings/agent-profile` | `AgentProfileSettings.tsx` | Usa `ProfileInfo` (avatar + icona camera che triggera file input). |
| `/settings/legal` | `LegalSettings.tsx` | Documenti legali, Info app, Contatta supporto, **Elimina account** (con AlertDialog e `handleDeleteAccount`). |
| `/settings/privacy-permissions` | `PrivacyPermissionsSettings.tsx` | Permessi (notifiche, geolocation, **camera**, microphone) + card **Esporta Dati** e **Elimina Account** senza handler. |
| `/profile` | `Profile.tsx` | Usa `ProfileInfo` (stesso file input per avatar). |
| `/settings/personal-info` | `PersonalInfoPage.tsx` | Avatar con `<input type="file" capture="environment">` (apre camera). |

---

## 3. PHASE 1 — CRASH CAMERA (FORENSICS)

### 3.A Punti in cui si apre camera / picker

| File | Riga | Meccanismo | Trigger UI |
|------|------|------------|------------|
| **`src/components/profile/ProfileInfo.tsx`** | 118-154 | `<input id="profile-image-input" type="file" accept="image/*">` + `onChange` upload Supabase. | Click su icona **Camera** (cyan) sopra avatar → `document.getElementById('profile-image-input')?.click()`. |
| **`src/pages/profile/PersonalInfoPage.tsx`** | 228-234 | `<input type="file" accept="image/jpeg,image/png,image/jpg" capture="environment">` + `handleAvatarUpload`. | Bottone con icona **Upload** accanto all’avatar → `fileInputRef.current?.click()`. |
| **`src/pages/settings/PrivacyPermissionsSettings.tsx`** | 116-120 | `navigator.mediaDevices.getUserMedia({ video: true })` per “richiedi permesso camera”. | Tap su permesso **camera** nella lista permessi (requestPermission('camera')). |

**Dettaglio critico:**  
- **PersonalInfoPage** è l’unico punto con **`capture="environment"`**: su iOS questo può invocare direttamente la **camera** (non solo photo library). Coerente con “Tapped to open the camera”.  
- **ProfileInfo** usa solo `accept="image/*"` senza `capture`: su iPad il sistema può mostrare “Camera” o “Photo Library”; se l’utente sceglie “Camera”, il flusso è simile.  
- **PrivacyPermissionsSettings** chiama **getUserMedia(video)** per testare il permesso: avvia lo stream della camera e può essere un altro punto di crash su iPad se WebKit/AVFoundation ha problemi.

### 3.B Info.plist (iOS)

**File:** `ios/App/App/Info.plist`

| Chiave | Presente | Valore (estratto) |
|--------|----------|-------------------|
| **NSCameraUsageDescription** | ✅ Sì | "Allows you to take a profile photo for your avatar." |
| **NSPhotoLibraryUsageDescription** | ✅ Sì | "Allows you to choose an image from your photo library for your profile avatar." |
| **NSPhotoLibraryAddUsageDescription** | ❌ No | Non presente (richiesta solo se l’app salva in libreria). |

**Conclusione:** Le chiavi minime per camera e libreria foto ci sono. L’assenza di `NSPhotoLibraryAddUsageDescription` non spiega un crash all’**apertura** camera.

### 3.C Permissions-Policy (camera disabilitata in CSP)

**File:** `src/security/csp.ts` (L92)

```ts
'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)',
```

**File:** `src/components/security/ProductionSecurityWrapper.tsx` — chiama `applySecurityHeaders()` che applica questi header (incluso Permissions-Policy) al documento.

In ambiente **web** questo disabilita l’uso di camera/microphone per il frame. In **Capacitor** il contenuto è servito da `capacitor://localhost`; se gli header vengono applicati via meta o in risposta, il browser/WKWebView potrebbe rispettarli e bloccare o alterare l’accesso alla camera, con possibili comportamenti anomali o crash quando l’app tenta comunque di aprirla.

### 3.D Crash log Apple

- **Nel repo:** Nessuna cartella `/docs`, `/crashlogs`, `/apple`, `/review` con crash log allegati.
- **Cosa servirebbe:** Crash log simbolicati (dSYM + binary) per vedere Exception Type, thread crashato, stack (WebKit, AVFoundation, UIKit, plugin Capacitor). Senza file in repo non è possibile correlare il simbolo al codice.

### 3.E Camera Crash Matrix (Apple-proof)

| Punto | File:riga | Requisiti plist | Rischio iPad |
|-------|-----------|------------------|--------------|
| Avatar profilo (ProfileInfo) | ProfileInfo.tsx:118-154 | ✅ NSCamera, NSPhotoLibrary | Medio: file input senza `capture`; scelta Camera da sistema. |
| Avatar personal info | PersonalInfoPage.tsx:228-234 | ✅ NSCamera, NSPhotoLibrary | **Alto:** `capture="environment"` → apertura diretta camera. |
| Richiesta permesso camera | PrivacyPermissionsSettings.tsx:116-120 | ✅ NSCamera | **Alto:** `getUserMedia({ video: true })` avvia stream; noti bug WebKit/AV su alcuni iPad. |

### 3.F Ipotesi principali (ordine) per crash su iPad Air M3

1. **PersonalInfoPage** — `<input capture="environment">` su WKWebView/iPadOS 26: il sistema presenta la camera nativa; un bug in WebKit o nel handoff al picker/camera può causare crash.  
2. **PrivacyPermissionsSettings** — `getUserMedia({ video: true })` su iPad M3/iPadOS 26: permessi o gestione stream (AVCaptureSession) in WebKit possono crashare.  
3. **ProfileInfo** — stesso file input (senza `capture`): se l’utente sceglie “Camera” dal foglio di azione, stesso percorso del punto 1.  
4. **Permissions-Policy `camera=()`** — conflitto tra policy “camera disabilitata” e tentativo di usare camera può portare a stati incoerenti e crash.

---

## 4. PHASE 2 — BOTTONI ACCOUNT NON RESPONSIVI

### 4.A Account section — Mappa bottoni

| Posizione | Bottone | Handler | Disabled / Note |
|-----------|---------|---------|------------------|
| Settings → Legale | Elimina Account Permanentemente | `handleDeleteAccount` (LegalSettings.tsx L92) | `disabled={loading}`. **Funzionante.** |
| Settings → Privacy e permessi | **Elimina Account** | **Nessun `onClick`** | **NON RESPONSIVO.** |
| Settings → Privacy e permessi | **Esporta Dati** | **Nessun `onClick`** | **NON RESPONSIVO.** |
| Settings (card) | Tutte le card | `onClick={() => handleSectionChange(section.id)}` | Navigate a `/settings/<id>`. |
| Profilo agente | Icona Camera su avatar | `onClick` → `document.getElementById('profile-image-input')?.click()` | Solo dove è usato `ProfileInfo`. |
| ProfilePage (standalone) | Icona Camera su avatar | **Nessun `onClick`** (bottone decorativo) | **NON RESPONSIVO** su quella pagina. |

**Prova testuale — PrivacyPermissionsSettings.tsx L353-360:**

```tsx
<Button
  variant="outline"
  className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 p-4 h-auto flex-col"
>
  <AlertTriangle className="w-6 h-6 mb-2" />
  <span className="font-medium">Elimina Account</span>
  <span className="text-sm text-white/70">Rimuovi permanentemente</span>
</Button>
```

Nessun attributo `onClick`. Stessa cosa per il bottone “Esporta Dati” (L344-351).

### 4.B Touch blockers (overlay, z-index, pointer-events)

| File | Elemento | Rischio |
|------|----------|---------|
| `BottomNavigation.tsx` | Container esterno `position: fixed`, `zIndex: 10000`, **`pointerEvents: "none"`**; pill interna **`pointerEvents: "auto"`** | Design corretto: solo la pill riceve tap. Possibile su iPad: area “auto” troppo piccola o hit-test diverso. |
| `MainLayout.tsx` | Header `fixed`, `z-50` | Può coprire parte contenuto se safe area/layout cambiano su iPad. |
| `SafeAreaWrapper.tsx` | Debug overlay `fixed`, `z-[10000]` | Solo in dev; non causa unresponsive in prod. |
| `PublicLayout.tsx` / `ProfileLayout.tsx` | Gradiente bottom `fixed`, `pointer-events-none` | Non blocca tap. |

Nessun overlay con `pointer-events: auto` trovato sopra le card Settings nelle pagine analizzate. La causa **diretta** trovata è l’**assenza di `onClick`** sui due bottoni in Privacy Permissions.

### 4.C Account Buttons Map (sintesi)

| Bottone | Handler | Condizioni disabled | Overlay potenziali |
|---------|----------|---------------------|--------------------|
| Elimina Account (Legal) | `handleDeleteAccount` | `loading` | No |
| **Elimina Account (Privacy Permissions)** | **Assente** | — | No |
| **Esporta Dati (Privacy Permissions)** | **Assente** | — | No |
| Camera avatar (ProfileInfo) | `profile-image-input.click()` | No | No |
| Camera avatar (ProfilePage) | **Assente** | — | No |

### 4.D Top-5 cause probabili “unresponsive” su iPad

1. **Bottoni senza handler** — “Elimina Account” e “Esporta Dati” in `/settings/privacy-permissions` senza `onClick`.  
2. **Bottone Camera su ProfilePage** — puramente decorativo, nessun `onClick`.  
3. **Hit area / tap su iPad** — BottomNavigation con pill e `pointer-events: auto`: su iPad potrebbero esserci differenze di hit-test o area effettiva.  
4. **Stato loading non resettato** — Se un loading da un’altra sezione non si chiude, bottoni con `disabled={loading}` restano disabilitati (non verificabile senza esecuzione).  
5. **Modale/overlay non visibile** — Nessuna evidenza da codice; possibile solo con stato runtime (es. dialog aperto ma non visibile).

---

## 5. PHASE 3 — ACCOUNT DELETION (5.1.1(v))

### 5.A Funzione di eliminazione account

| Cosa | Presente | File / Riga | Dettaglio |
|------|----------|--------------|-----------|
| UI “Elimina account” | ✅ Sì | LegalSettings.tsx L252-314; LegalSectionContent.tsx L195-241 | Bottone + conferma (AlertDialog) + `handleDeleteAccount`. |
| Flusso conferma | ✅ Sì | AlertDialogTrigger + AlertDialogAction `onClick={handleDeleteAccount}` | Utente deve confermare. |
| Eliminazione **dati app** | ✅ Sì | LegalSettings.tsx L97-108; LegalSectionContent.tsx L73-81 | Delete da: `user_clues`, `user_buzz_counter`, `user_notifications`, `subscriptions`, `profiles`. Poi `signOut()`, `localStorage.clear()`, redirect `/login`. |
| Eliminazione **Auth (Supabase)** | ❌ No | — | **Nessuna** chiamata a `supabase.auth.admin.deleteUser(user.id)` né a edge function che elimini l’utente da `auth.users`. L’account Auth resta valido: l’utente può ri-accedere con le stesse credenziali. |
| Edge function user-facing | ❌ No | `supabase/functions/admin-delete-user/index.ts` | Solo **admin** (hash email): `auth.admin.deleteUser(user_id)`. Non usata dall’app per “elimina il mio account”. |

### 5.B Label e percorsi

- **Settings → Legale** (`/settings/legal`): sezione “Zona Pericolosa”, “Elimina Account Permanentemente”, “Elimina Definitivamente” in conferma.  
- **Settings (modal)** → Legale (LegalSectionContent): “Elimina Account Permanentemente”, “Conferma Eliminazione”.  
- **Privacy Permissions** (`/settings/privacy-permissions`): bottone “Elimina Account” **senza** azione (vedi Phase 2).  
- Traduzioni: `delete_account_warning`, `delete_account_permanently`, `account_deleted` in `locales/{it,en,fr}/common.json`.

### 5.C Account Deletion Compliance Check (Apple-proof)

| Domanda | Risposta | Prova (file:riga) |
|---------|----------|-------------------|
| UI “Elimina account” presente in-app? | **Sì** | LegalSettings.tsx L252-314; LegalSectionContent.tsx L195-241. |
| Endpoint/backend che elimina **l’account Auth** (auth.users)? | **No** | handleDeleteAccount non chiama admin API né edge delete-user per l’utente corrente. admin-delete-user è solo admin. |
| Link diretto in-app a cancellazione “completa” (es. web)? | **No** | Nessun link a pagina esterna di account deletion. |
| Dopo “Elimina account” l’utente può ri-login con stesso email? | **Sì** | Perché auth.users non viene modificato. |

**Gap rispetto a 5.1.1(v):**  
Apple richiede che l’app che consente la **creazione** account offra anche la **cancellazione** account. L’app offre un flusso “Elimina account” che rimuove dati in-app e fa signOut, ma **non** rimuove l’identità da Supabase Auth. Un revisore può considerare che “l’account” non sia effettivamente eliminato (l’utente può rientrare). Per essere “Apple-proof” andrebbe fornita una cancellazione che includa anche **auth.users** (tramite edge function o admin API chiamata in modo sicuro dall’utente).

---

## 6. EVIDENZE (RIFERIMENTI FILE + ESTRATTI)

### 6.1 Camera / file input

- **ProfileInfo.tsx L110-122** — Trigger camera/picker da icona Camera:
```tsx
<div
  className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1.5 cursor-pointer ..."
  onClick={() => document.getElementById('profile-image-input')?.click()}
>
  <Camera className="w-3 h-3 text-black" />
</div>
<input id="profile-image-input" type="file" accept="image/*" ... />
```

- **PersonalInfoPage.tsx L228-234** — Input con `capture="environment"`:
```tsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/jpeg,image/png,image/jpg"
  capture="environment"
  onChange={handleAvatarUpload}
  className="hidden"
/>
```

- **PrivacyPermissionsSettings.tsx L115-120** — getUserMedia camera:
```tsx
case 'camera':
  if ('mediaDevices' in navigator) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
```

### 6.2 Info.plist

- **ios/App/App/Info.plist L29-33**:
```xml
<key>NSCameraUsageDescription</key>
<string>Allows you to take a profile photo for your avatar.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Allows you to choose an image from your photo library for your profile avatar.</string>
```

### 6.3 Bottoni non responsivi

- **PrivacyPermissionsSettings.tsx L353-360** — Bottone “Elimina Account” senza onClick:
```tsx
<Button
  variant="outline"
  className="bg-red-500/10 border-red-500/30 text-red-400 ..."
>
  <AlertTriangle className="w-6 h-6 mb-2" />
  <span className="font-medium">Elimina Account</span>
  <span className="text-sm text-red-300/70">Rimuovi permanentemente</span>
</Button>
```

### 6.4 Account deletion (flusso attuale)

- **LegalSettings.tsx L92-127** — handleDeleteAccount (solo tabelle + signOut, nessun auth delete):
```tsx
const handleDeleteAccount = async () => {
  // ...
  await supabase.from('user_clues').delete().eq('user_id', user.id);
  await supabase.from('user_buzz_counter').delete()...
  await supabase.from('user_notifications').delete()...
  await supabase.from('subscriptions').delete()...
  await supabase.from('profiles').delete().eq('id', user.id);
  await supabase.auth.signOut();
  localStorage.clear();
  window.location.href = '/login';
};
```

---

## 7. RISCHI E RIPRODUCIBILITÀ APPLE

| Punto | Probabilità che Apple lo riproduca | Motivo |
|-------|------------------------------------|--------|
| Crash camera | **Alta** | Flusso “open camera” chiaro (tap avatar/camera); iPadOS 26 + WKWebView + file input/getUserMedia sono percorsi noti per crash. |
| Bottoni unresponsive | **Alta** | Revisore va in Account/Settings e tocca “Elimina Account” in Privacy Permissions: nessuna reazione (nessun onClick). |
| Account deletion insufficiente | **Media** | UI “Elimina account” c’è in Legale; se il revisore verifica solo la presenza del flusso può passare; se verifica che l’account non può più accedere, può contestare (auth non eliminato). |

---

## 8. CHECKLIST RESUBMIT (COSA DEVE ESSERE VERO PRIMA DI NUOVA BUILD)

- [ ] **Crash camera:** Verificare su iPad Air M3 / iPadOS 26 (o equivalente): tap “open camera” da Personal Info e da Profilo; nessun crash. Considerare rimozione di `capture="environment"` o uso di Capacitor Camera plugin; valutare spostamento/rimozione test permesso camera con getUserMedia in Privacy Permissions.
- [ ] **Bottoni account:** In `/settings/privacy-permissions`, “Elimina Account” e “Esporta Dati” devono avere azione (onClick: navigazione a flusso eliminazione / export dati). In ProfilePage, bottone Camera su avatar: o collegare a file input o rimuovere.
- [ ] **Account deletion:** Flusso “Elimina account” deve rimuovere anche l’utente da **Supabase Auth** (tramite edge function o API sicura), non solo dati app + signOut. Oppure link diretto in-app a pagina/processo che garantisca cancellazione completa (e documentarlo per review).
- [ ] **Permissions-Policy:** Valutare se `camera=()` in produzione (Capacitor) influisce su WKWebView; se sì, differenziare policy per contesto app (es. non applicare restrizione camera in build nativa).
- [ ] **Test manuale:** Su dispositivo iPad (o simulatore): Login → Settings → ogni sottosezione (inclusa Privacy Permissions e Legale) → tap su ogni bottone rilevante → nessun crash, tutti i bottoni rispondono.

---

## 9. CONCLUSIONI (SI/NO)

| # | Domanda | Risposta |
|---|---------|----------|
| 1 | Cause candidate per crash camera identificate in codice? | **Sì** — PersonalInfoPage `capture="environment"`, ProfileInfo file input, PrivacyPermissionsSettings getUserMedia(video). |
| 2 | Bottoni “account” non responsivi con causa in codice? | **Sì** — “Elimina Account” e “Esporta Dati” in PrivacyPermissionsSettings senza onClick; Camera su ProfilePage senza onClick. |
| 3 | Funzione “Account Deletion” presente e conforme? | **Parziale** — UI e flusso conferma presenti in Legale; cancellazione **completa** (auth.users) assente; possibile non conformità 5.1.1(v). |

---

*Report generato in modalità read-only. Nessuna modifica applicata al repository.*
