# PE Daily Action — record_pe_daily_action .catch is not a function

## Root cause (FASE 1)

- **File:** `src/features/pulse/hooks/useAwardPE.ts`
- **Righe:** 193–199 (prima del fix)
- **Problema:** `supabase.rpc('record_pe_daily_action', {...}).catch(...)` — il valore restituito da `supabase.rpc()` in alcuni ambienti (es. iOS WKWebView/bundle) è thenable ma **non** una Promise con `.catch`, quindi `.catch is not a function`.
- **Conclusione:** uso di `.catch()` su un thenable che non espone `.catch` (CASE 2: trattato come Promise ma API diversa).

## Fix applicato (FASE 3)

- Sostituito il pattern `await supabase.rpc(...).catch(...)` con:
  - `try { const { error } = await supabase.rpc(...); if (error) warn (solo DEV) } catch (_err) { warn (solo DEV) }`
- Nessun cambiamento di semantica PE: in caso di errore RPC si logga solo in DEV e si prosegue senza crash.

## Rollback (1 comando)

```bash
git reset --hard safety/pre-ios-pe-rpc-fix-20260303
```

Oppure annullare solo le modifiche ai file:

```bash
git checkout . && git clean -fd
```

## Checklist post-fix (FASE 4)

- [ ] Nessun "[PE] ❌ Exception … .catch is not a function" in Xcode
- [ ] Nessun crash UI su daily action PE
- [ ] Award PE e UI non bloccati
- [ ] Login / Home / BUZZ / BUZZ MAP / IAP getProducts invariati
