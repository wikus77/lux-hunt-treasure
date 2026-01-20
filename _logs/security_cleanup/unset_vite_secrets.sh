#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="vkjrqirvdvjbemsfzxof"
LOG="_logs/security_cleanup/secrets_removal_output.txt"

SECRETS=(
  VITE_FIREBASE_API_KEY
  VITE_FIREBASE_APP_ID
  VITE_FIREBASE_AUTH_DOMAIN
  VITE_FIREBASE_MESSAGING_SENDER_ID
  VITE_FIREBASE_PROJECT_ID
  VITE_FIREBASE_STORAGE_BUCKET
  VITE_FIREBASE_VAPID_KEY
  VITE_STRIPE_PUBLISHABLE_KEY_LIVE
  VITE_STRIPE_PUBLISHABLE_KEY_TEST
)

echo "=== FASE B: SECRETS REMOVAL (ONE BY ONE) ===" | tee "$LOG"
echo "Started at $(date)" | tee -a "$LOG"
echo "Project: $PROJECT_REF" | tee -a "$LOG"
echo "" | tee -a "$LOG"

for s in "${SECRETS[@]}"; do
  echo "---- Unset: $s ----" | tee -a "$LOG"
  if supabase secrets unset "$s" --project-ref "$PROJECT_REF" --yes >>"$LOG" 2>&1; then
    echo "OK: removed $s" | tee -a "$LOG"
  else
    echo "SKIP/ERR: $s (not found or no perms)" | tee -a "$LOG"
    echo "" | tee -a "$LOG"
  fi
  echo "" | tee -a "$LOG"
done

echo "DONE at $(date)" | tee -a "$LOG"
echo "Log: $LOG" | tee -a "$LOG"
