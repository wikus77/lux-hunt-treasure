set -euo pipefail

PROJECT_REF="vkjrqirvdvjbemsfzxof"
SUPA_PAT="sbp_476566dc34a0d8c2869d5c07b5ac4a2d44e277dd"

mkdir -p supabase/functions

download_and_extract () {
  local SLUG="$1"
  local OUTDIR="supabase/functions/$SLUG"
  mkdir -p "$OUTDIR"

  # Proviamo più endpoint
  local ENDPOINTS=(
    "https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/${SLUG}/source"
    "https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/${SLUG}/bundle"
    "https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/${SLUG}/download"
  )

  local OK=0
  for URL in "${ENDPOINTS[@]}"; do
    echo "→ Provo $URL"
    TMP="/tmp/${SLUG}.bin"
    HDR="/tmp/${SLUG}.hdr"
    rm -f "$TMP" "$HDR"

    if ! curl -sSfL -D "$HDR" \
      -H "Authorization: Bearer $SUPA_PAT" \
      -H "apikey: $SUPA_PAT" \
      -H "Accept: application/octet-stream" \
      -H "User-Agent: m1ssion-cli" \
      "$URL" -o "$TMP"; then
      echo "  curl fallita, provo prossimo…"
      continue
    fi

    CT="$(awk -F': ' 'tolower($1)=="content-type"{print tolower($2)}' "$HDR" | tr -d '\r' || true)"
    echo "  Content-Type: ${CT:-<vuoto>}"
    echo

    # Se è JSON, stampa l'errore e passa al prossimo endpoint
    if [[ "${CT:-}" == application/json* ]]; then
      echo "  ⚠️ Risposta JSON (permessi/endpoint?):"
      cat "$TMP"; echo
      continue
    fi

    # Rileva formato ed estrai
    if file --mime-type "$TMP" 2>/dev/null | grep -q 'application/x-gzip'; then
      tar -xzf "$TMP" -C "$OUTDIR" || { echo "  ❌ tar fallita"; continue; }
      OK=1
    elif file --mime-type "$TMP" 2>/dev/null | grep -q 'application/zip'; then
      unzip -o -q "$TMP" -d "$OUTDIR" || { echo "  ❌ unzip fallita"; continue; }
      OK=1
    else
      # Tentativi “alla cieca”
      if tar -tzf "$TMP" >/dev/null 2>&1; then
        tar -xzf "$TMP" -C "$OUTDIR" && OK=1
      elif unzip -tq "$TMP" >/dev/null 2>&1; then
        unzip -o -q "$TMP" -d "$OUTDIR" && OK=1
      else
        echo "  ❌ Formato sconosciuto. Primi 200 byte:"
        head -c 200 "$TMP" | hexdump -C
        echo
      fi
    fi

    rm -f "$TMP"
    [[ $OK -eq 1 ]] && break
  done

  if [[ $OK -eq 1 ]]; then
    echo "✅ Estratto in $OUTDIR"
    if ls "$OUTDIR"/index.* 1>/dev/null 2>&1; then
      echo "   → trovato: $(basename "$(ls "$OUTDIR"/index.* | head -1)")"
    else
      echo "   ⚠️ non trovo index.ts/js — contenuto:"
      find "$OUTDIR" -maxdepth 2 -type f | sed 's/^/     - /'
    fi
  else
    echo "❌ Non sono riuscito a scaricare $SLUG da nessun endpoint."
  fi
}

for FN in push-broadcast webpush-admin-broadcast; do
  echo "=========================="
  echo "Scarico funzione: $FN"
  download_and_extract "$FN"
done
