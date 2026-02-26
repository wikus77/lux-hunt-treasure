# PHASE 5 — BOOT_ERROR (Function failed to start)

## Root cause

503 BOOT_ERROR "Function failed to start" indica che la Edge Function (Deno) **non si avvia**: crash in fase di bootstrap, prima di gestire la richiesta. Cause tipiche:

- **Env mancanti:** `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY` non impostati in Dashboard → uso di `Deno.env.get("...")` che restituisce stringa vuota → eventuale uso successivo (es. `createClient(url, serviceKey)`) può causare crash.
- **Import path errato** o modulo non disponibile nel runtime.
- **Runtime error** su parse JSON o prima chiamata DB.

## Fix applicato (già in repo)

In **send-marker-prize-email** e **send-final-shoot-winner-email** è presente una **guard all’inizio dell’handler** (subito dopo OPTIONS):

```ts
const url = Deno.env.get("SUPABASE_URL")?.trim() || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";
if (!url || !serviceKey) {
  return new Response(
    JSON.stringify({ error: "boot_config_missing", message: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

Se le variabili mancano, la function risponde **500** con messaggio tecnico (nessun secret) invece di andare in crash → **nessun BOOT_ERROR** da env mancanti.

## Se BOOT_ERROR persiste

1. **Dashboard** → Edge Functions → funzione interessata → **Logs**.
2. Cercare la **riga precisa** dello stacktrace (es. "Module not found", "Permission denied", errore su prima linea di codice).
3. **Fix minimo:** correggere import, aggiungere env mancante in Dashboard, o gestire il caso (guard/early return) che causa il crash.

Non cambiare logica di invio email; solo evitare crash in bootstrap.
