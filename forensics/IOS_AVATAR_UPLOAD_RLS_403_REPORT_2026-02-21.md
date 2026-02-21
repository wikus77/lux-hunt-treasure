# iOS AVATAR UPLOAD — RLS 403 ROOT CAUSE + FIX REPORT

**Branch:** `fix/ios-avatar-upload-rls`  
**Tag rollback:** `safety/ios-avatar-upload-before-20260221_063000`  
**Sintomo:** Avatar non cambia / non persiste; log Xcode: `StorageApiError` → `new row violates row-level security policy` → 403.

---

## 1) FLOW → PATH → DB UPDATE → RISK RLS (TABELLA FORENSICA)

| Flow | File | Linee | Path usato (prima del fix) | DB update | Rischio RLS |
|------|------|-------|----------------------------|-----------|-------------|
| **Agent Profile / Profile** | `ProfileInfo.tsx` | 128–155 | `avatar-${Date.now()}.${ext}` **(ROOT bucket)** | Solo su "Salva" (setProfileImage → parent state) | **ALTO** — path in root viola policy tipo `(bucket_id = 'avatars' AND name LIKE auth.uid()::text || '/%')` |
| Personal Info | `PersonalInfoPage.tsx` | 65–90 | `${user.id}/avatar_${Date.now()}.${ext}` | Immediato (`profiles.avatar_url`) | Basso (path user-scoped) |
| ProfilePage | `ProfilePage.tsx` | 276–287 | `${user.id}/avatar_${Date.now()}.${ext}` | Immediato | Basso |
| useProfileImage (hook) | `useProfileImage.ts` | 25–26 | `profiles/${session.user.id}.jpg` | Caller | Medio (prefisso `profiles/` non `user.id/`; policy potrebbe richiedere `auth.uid()/%`) |

**Causa esatta del 403:**  
Il flow **ProfileInfo** (Settings → Profilo Agente, Profile, modal Profilo) caricava con path **in root** del bucket (`avatar-1234567890.jpg`). Le policy Supabase Storage sul bucket `avatars` tipicamente consentono INSERT solo per oggetti il cui `name` (path) inizia con `auth.uid()/` (es. `uuid/avatar_xxx.jpg`). Un path senza prefisso user (`avatar-xxx.jpg`) non soddisfa la condizione → **403 new row violates row-level security policy**.

---

## 2) EVIDENZA CODICE (PRIMA DEL FIX)

**ProfileInfo.tsx L128 (vecchio):**
```ts
const fileName = `avatar-${Date.now()}.${file.name.split('.').pop()}`;
```
- Nessun `user.id` nel path → root bucket.
- Nessun aggiornamento diretto a `profiles.avatar_url` (solo stato locale; persistenza al "Salva").

---

## 3) FIX APPLICATO (SOLO CODICE — OPZIONE 1)

**File modificato:** `src/components/profile/ProfileInfo.tsx`

- Path standardizzato su **user-scoped:** `${user.id}/avatar_${Date.now()}.${ext}` (stesso schema di PersonalInfoPage e ProfilePage).
- `user` ottenuto con `supabase.auth.getUser()` all’inizio dell’handler.
- Dopo upload: aggiornamento immediato di `profiles.avatar_url` e `updated_at` (persistenza senza "Salva").
- Log minimale su errore: `[Avatar] upload failed path=... error=...` e `[Avatar] profile update failed`.
- `e.target.value = ''` in `finally` per permettere di riscegliere lo stesso file.

**PersonalInfoPage e ProfilePage:** già con path `${user.id}/avatar_...` → nessuna modifica.

---

## 4) SUPABASE — POLICY STORAGE (READ-ONLY)

Cursor non ha accesso al DB. Esegui nel **SQL Editor** Supabase (solo lettura) per elencare le policy su `storage.objects`:

```sql
-- READ-ONLY: elenca policy su storage.objects (bucket avatars)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Per filtrare solo policy che riguardano il bucket `avatars`, in Supabase le policy storage spesso usano `bucket_id = 'avatars'` in qual/with_check. Se la policy INSERT richiede qualcosa tipo `(bucket_id = 'avatars' AND name LIKE (auth.uid())::text || '/%')`, allora il path **deve** essere `{user_id}/...`.

---

## 5) OPZIONE 2 — POLICY MINIMA (SOLO SE NECESSARIA)

Se dopo il fix codice il 403 persiste (es. policy assente o diversa), si può aggiungere una policy minima per INSERT su `storage.objects` per il bucket `avatars`:

```sql
-- Inserire solo oggetti nel proprio prefisso (auth.uid()/...)
CREATE POLICY "avatars_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (name LIKE (auth.uid())::text || '/%')
);

-- Rollback (eseguire solo per annullare):
-- DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
```

Non creare policy pubbliche o permissive oltre allo stretto necessario.

---

## 6) ROLLBACK IMMEDIATO (GIT)

**Ripristinare solo i file toccati al tag:**
```bash
git checkout safety/ios-avatar-upload-before-20260221_063000 -- src/components/profile/ProfileInfo.tsx
```

**Revert ultimo commit (dopo il commit del fix):**
```bash
git revert HEAD --no-edit
```

**Reset hard al tag (pericoloso, perde modifiche non committate):**
```bash
git reset --hard safety/ios-avatar-upload-before-20260221_063000
```

**Diff prima del commit:**
```bash
git diff --no-color src/components/profile/ProfileInfo.tsx
```

---

## 7) CHECKLIST TEST iOS (DA COMPILARE SU DEVICE)

Dopo `npm run build` e `npx cap sync ios`:

- [ ] **A)** Agent Profile: tap camera → Photo Library → upload OK → avatar cambia → persiste dopo kill/reopen
- [ ] **B)** Agent Profile: tap camera → Take Photo → upload OK → avatar cambia → persiste
- [ ] **C)** Personal Info: stesso flusso OK
- [ ] **D)** Nessun 403 in log Xcode
- [ ] **E)** Smoke: home / map / buzz / auth senza regressioni

---

*Report generato dopo fix su ProfileInfo. Nessuna modifica a iOS wrapper nativo.*
