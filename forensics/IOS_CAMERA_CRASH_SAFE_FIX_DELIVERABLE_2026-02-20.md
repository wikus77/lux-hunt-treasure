# iOS CAMERA CRASH — SAFE FIX DELIVERABLE (CON ROLLBACK)

**Branch:** `fix/ios-camera-crash-safe`  
**Tag rollback:** `safety/ios-camera-crash-before-20260220_120000`  
**Scope:** Solo 3 file modificati. Nessuna modifica fuori scope.

---

## 1) PIANO ROLLBACK + COMANDI

### Branch e tag già creati
- **Branch:** `fix/ios-camera-crash-safe` (creato da `fix/aion-oracle-quality` o da HEAD corrente)
- **Tag:** `safety/ios-camera-crash-before-20260220_120000`

### Comandi utili

**Vedere diff dei file toccati (prima del commit):**
```bash
git diff --no-color src/pages/profile/PersonalInfoPage.tsx src/pages/settings/PrivacyPermissionsSettings.tsx src/pages/ProfilePage.tsx
```

**Vedere diff dopo commit (ultimo commit):**
```bash
git show --no-color HEAD
```

**Tornare allo stato pre-patch (reset hard al tag — pericolo: perdi modifiche locali non committate):**
```bash
git fetch --tags
git checkout safety/ios-camera-crash-before-20260220_120000
git checkout -B fix/ios-camera-crash-safe  # opzionale: riporta il branch al tag
# oppure, per ripristinare solo i 3 file allo stato del tag:
git checkout safety/ios-camera-crash-before-20260220_120000 -- src/pages/profile/PersonalInfoPage.tsx src/pages/settings/PrivacyPermissionsSettings.tsx src/pages/ProfilePage.tsx
```

**Annullare solo gli ultimi commit (revert, senza riscrivere storia):**
```bash
# Dopo aver fatto 1 commit con le patch:
git revert HEAD --no-edit

# Se hai fatto più commit e vuoi revertare solo l’ultimo:
git revert HEAD --no-edit
# Ripeti per ogni commit da annullare, dal più recente.
```

**Verificare tag e branch:**
```bash
git tag -l 'safety/ios-camera*'
git branch --show-current
```

---

## 2) PATCH MINIMALE — RIEPILOGO

| File | Modifica | Motivo | Rischio |
|------|----------|--------|---------|
| **PersonalInfoPage.tsx** | Rimosso attributo `capture="environment"` dall’input file avatar | `capture` forza apertura camera diretta → rischio crash WKWebView su iPad | Basso: picker standard (camera o libreria) resta disponibile |
| **PrivacyPermissionsSettings.tsx** | Sostituito `getUserMedia({ video: true })` con toast informativo | Avvio stream video in WKWebView può crashare su iPadOS | Basso: nessun stream; messaggio “Il permesso camera verrà richiesto quando usi una funzione che ne ha bisogno (es. foto profilo).” |
| **ProfilePage.tsx** | Bottone camera reso funzionante: `useRef` + hidden `<input type="file" accept="image/*">` + onClick + onChange (upload avatars, update profiles.avatar_url) | Prima era decorativo (no onClick/input) → UX incoerente | Basso: stesso pattern di PersonalInfoPage, senza `capture` |

### Diff (estratti)

- **PersonalInfoPage.tsx:** una riga rimossa: `capture="environment"`.
- **PrivacyPermissionsSettings.tsx:** case `camera` non chiama più `getUserMedia`; mostra toast e `granted = true`.
- **ProfilePage.tsx:** aggiunti `useRef`, stato `avatarUploading`, bottone con `onClick` e `disabled`, input nascosto `accept="image/*"`, handler `onChange` (validazione, upload bucket `avatars`, update `profiles.avatar_url`, toast, reset input).

---

## 3) CHECKLIST TEST iOS (DA COMPLETARE SU DEVICE)

Eseguire su **iOS reale** (iPad/iPhone) dopo build + sync Capacitor. Segnare ✅/❌.

### A) Informazioni Personali — upload avatar
- [ ] Login → Settings → Informazioni Personali → tap bottone upload avatar
- [ ] Si apre picker (libreria/camera), **nessun crash**
- [ ] Selezione immagine → avatar cambia in pagina
- [ ] Dopo refresh/kill-reopen app → avatar resta aggiornato

### B) Privacy e permessi — camera
- [ ] Settings → Privacy e permessi → tap su “camera” / richiedi permesso camera
- [ ] **NON** parte stream video, **nessun crash**
- [ ] UI risponde con messaggio tipo “Il permesso camera verrà richiesto quando usi una funzione che ne ha bisogno (es. foto profilo).”

### C) ProfilePage — avatar camera
- [ ] Andare alla schermata che usa `ProfilePage` (route che renderizza ProfilePage)
- [ ] Tap icona camera su avatar → si apre picker
- [ ] Selezione immagine → avatar si aggiorna, toast “Avatar aggiornato”
- [ ] Dopo refresh/kill-reopen → avatar persiste

### D) Non regressione (smoke)
- [ ] Home: si apre e funziona
- [ ] Map: si apre e funziona
- [ ] Buzz: si apre e funziona
- [ ] Payments: si apre e funziona
- [ ] Auth (login/logout): funziona come prima

**Risultato test:** _da compilare_ (es. “A ✅ B ✅ C ✅ D ✅” o elenco fail).

---

## 4) COMMIT SUGGERITI

Dopo aver verificato le modifiche:

```bash
git add src/pages/profile/PersonalInfoPage.tsx src/pages/settings/PrivacyPermissionsSettings.tsx src/pages/ProfilePage.tsx
git commit -m "fix(ios): camera crash safe — remove capture + disable getUserMedia camera test + ProfilePage avatar real

- PersonalInfoPage: remove capture=\"environment\" (EP2) to avoid direct camera open in WKWebView
- PrivacyPermissionsSettings: replace getUserMedia(video) with toast (EP3) to avoid stream crash on iPadOS
- ProfilePage: make avatar camera button functional (file input + upload to avatars + profiles.avatar_url)
Scope: only these 3 files. Rollback: tag safety/ios-camera-crash-before-20260220_120000"
```

---

## 5) BUILD / TYPECHECK

- **Build:** `npm run build` — **completato con successo** (exit 0).
- **Lint:** nessun errore riportato sui 3 file modificati.

---

*Deliverable generato dopo applicazione patch. Test manuali su device da eseguire da te.*
