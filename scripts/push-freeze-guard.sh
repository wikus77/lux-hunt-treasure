#!/bin/bash
# © 2026 Joseph MULÉ – M1SSION™ – PUSH FREEZE GUARD
# 
# Questo script verifica che nessun file push-critical sia stato modificato.
# Eseguire prima di commit per evitare modifiche accidentali.
#
# Usage: npm run guard:push
#        ./scripts/push-freeze-guard.sh

set -e

echo "🔒 M1SSION Push Freeze Guard"
echo "════════════════════════════════════════════"

# Lista file push-critical (pattern)
PUSH_PATTERNS=(
  "src/hooks/useNativePush.ts"
  "src/lib/nativePush.ts"
  "src/utils/push-ios.ts"
  "src/utils/safeWebPushSubscribe.ts"
  "src/utils/pushSubscribe.ts"
  "src/utils/pushPlatform.ts"
  "src/push/"
  "public/sw.js"
  "public/sw-cleanup.js"
  "supabase/functions/auto-push-cron/"
  "supabase/functions/send-native-push/"
  "supabase/functions/push_"
  "supabase/functions/push-"
  "supabase/functions/webpush-"
)

# Ottieni file modificati (staged + unstaged)
MODIFIED_FILES=$(git diff --name-only HEAD 2>/dev/null || git diff --name-only)
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || echo "")

ALL_CHANGED="$MODIFIED_FILES $STAGED_FILES"

VIOLATIONS=()

for pattern in "${PUSH_PATTERNS[@]}"; do
  for file in $ALL_CHANGED; do
    if [[ "$file" == *"$pattern"* ]]; then
      VIOLATIONS+=("$file")
    fi
  done
done

# Remove duplicates
UNIQUE_VIOLATIONS=($(echo "${VIOLATIONS[@]}" | tr ' ' '\n' | sort -u))

if [ ${#UNIQUE_VIOLATIONS[@]} -gt 0 ]; then
  echo ""
  echo "❌ PUSH FREEZE VIOLATION DETECTED!"
  echo ""
  echo "I seguenti file push-critical sono stati modificati:"
  for v in "${UNIQUE_VIOLATIONS[@]}"; do
    echo "  - $v"
  done
  echo ""
  echo "⚠️  Se la modifica è intenzionale, l'utente deve scrivere:"
  echo '   "UNLOCK PUSH: [descrizione]"'
  echo ""
  echo "Per annullare le modifiche:"
  echo "  git checkout -- <file>"
  echo ""
  exit 1
else
  echo "✅ Nessun file push-critical modificato"
  echo "   Push system is FROZEN and SAFE"
  echo ""
  exit 0
fi
