#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "🔍 BEFORE - references to old Lovable Cloud project:"
rg -n "heqgsrofojvqiovkbsfn" || echo "✅ nessun match"
rg -n "https://heqgsrofojvqiovkbsfn.supabase.co" || echo "✅ nessun match"

echo "🧹 Replacing old project ID and URL with external Supabase only…"

find . \
  -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" -o -name "*.cjs" -o -name "*.json" -o -name ".env*" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/.git/*" \
  -print0 | xargs -0 perl -pi -e 's#https://heqgsrofojvqiovkbsfn\.supabase\.co#https://vkjrqirvdvjbemsfzxof.supabase.co#g'

find . \
  -type f \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" -o -name "*.cjs" -o -name "*.json" -o -name ".env*" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/.git/*" \
  -print0 | xargs -0 perl -pi -e 's#heqgsrofojvqiovkbsfn#vkjrqirvdvjbemsfzxof#g'

echo "🔍 AFTER - verify no old project refs remain:"
rg -n "heqgsrofojvqiovkbsfn" || echo "✅ nessun match"
rg -n "https://heqgsrofojvqiovkbsfn.supabase.co" || echo "✅ nessun match"

echo "✅ Cleanup completato: solo progetto vkjrqirvdvjbemsfzxof"
