# Switch app to delete-account-v2 — Output report

**Scope:** App invokes delete-account-v2 instead of delete-account; success check uses `data?.ok`.

---

## 1. Tag and commit

| Item | Value |
|------|--------|
| **Rollback tag** | `pre-switch-delete-account-v2-20260302-1141` |
| **Commit hash (full)** | `d97e37bcb73512f362e44dd9cdd4616b40609ee2` |
| **Commit hash (short)** | `d97e37bcb` |

---

## 2. Files changed

| File | Change |
|------|--------|
| `src/components/m1units/DeleteAccountModalContent.tsx` | invoke `'delete-account'` → `'delete-account-v2'`; `data?.success !== true` → `data?.ok !== true` |
| `src/pages/settings/LegalSettings.tsx` | invoke `'delete-account'` → `'delete-account-v2'`; `data?.success !== true` → `data?.ok !== true` |

**No other files modified.** No routing, auth, BUZZ, map, payments, notifications, or other edge functions touched.

---

## 3. Diff summary per file

### DeleteAccountModalContent.tsx
- `supabase.functions.invoke('delete-account', ...)` → `supabase.functions.invoke('delete-account-v2', ...)`
- `if (data?.success !== true) throw ...` → `if (data?.ok !== true) throw ...`

### LegalSettings.tsx
- `supabase.functions.invoke('delete-account', ...)` → `supabase.functions.invoke('delete-account-v2', ...)`
- `if (data?.success !== true) { throw ... }` → `if (data?.ok !== true) { throw ... }`

---

## 4. PHASE 1 — Discovery (call-sites)

| File | Component / handler | Previous success check |
|------|----------------------|-------------------------|
| `src/components/m1units/DeleteAccountModalContent.tsx` | `handleDelete` | `data?.success !== true` → throw |
| `src/pages/settings/LegalSettings.tsx` | `handleDeleteAccount` | `data?.success !== true` → throw |

**Flows:** Two entry points — (1) M1U delete-account modal, (2) Settings → Legal → delete account. No shared abstraction; both call `supabase.functions.invoke` directly. No other references to `delete-account` in app source (only comments/IDs).

---

## 5. Rollback command

To restore state before this switch:

```bash
git reset --hard pre-switch-delete-account-v2-20260302-1141
```

Or to restore only the two files:

```bash
git checkout pre-switch-delete-account-v2-20260302-1141 -- src/components/m1units/DeleteAccountModalContent.tsx src/pages/settings/LegalSettings.tsx
```

---

## 6. PHASE 4 — E2E verification

### 6.1 Local UI smoke
- **Modal flow:** Open M1U / danger zone → trigger “Delete account” → confirm. Request must go to `/functions/v1/delete-account-v2`.
- **Settings flow:** Settings → Legal / privacy → “Elimina account” → confirm. Same endpoint.

### 6.2 DevTools Network proof
1. Open DevTools → **Network**.
2. Filter by **Fetch/XHR** (or filter by text: `delete-account`).
3. Trigger delete from the app (modal or Settings).
4. Find the request: **Request URL** must contain `delete-account-v2` (e.g. `https://<project>.supabase.co/functions/v1/delete-account-v2`).
5. **Request Headers** should include `Authorization: Bearer <token>` and `apikey: <anon_key>` (Supabase client adds these when using `supabase.functions.invoke` with session).
6. **Response:** 200 with body `{"ok":true}` on success; 401/500 with `{"ok":false,...}` on failure.

### 6.3 Expected result
- No request to `delete-account` (v1); only `delete-account-v2`.
- On `{ "ok": true }`: sign-out, localStorage clear, redirect to `/login` (unchanged behavior).
- On `{ "ok": false }` or error: existing toast/error path (unchanged).

---

## 7. Build

- **Command:** `npm run build`
- **Result:** Success (exit 0). No TypeScript errors from these edits.
