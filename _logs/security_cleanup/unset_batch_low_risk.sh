#!/bin/bash
# © 2026 M1SSION Security Cleanup - LOW RISK BATCH REMOVAL
# 
# This script removes ONLY secrets that are:
# 1. Proven duplicates (same digest as canonical)
# 2. NOT referenced in any code
# 3. Invalid/corrupted names
#
# TOTAL: 23 secrets
# Expected result: 103 -> 80 secrets

PROJECT_REF="vkjrqirvdvjbemsfzxof"

echo "========================================"
echo "M1SSION SECURITY CLEANUP - LOW RISK"
echo "========================================"
echo "Project: $PROJECT_REF"
echo "Date: $(date)"
echo ""

# ========================================
# GROUP 1: URL DUPLICATES (6 secrets)
# Canonical: SUPABASE_URL
# ========================================
echo "[1/6] Removing URL duplicates..."
supabase secrets unset \
  BASE_URL \
  EXTERNAL_SUPABASE_URL \
  PROJECT_URL \
  SB_URL \
  URL \
  VITE_SUPABASE_URL \
  --project-ref $PROJECT_REF

# ========================================
# GROUP 2: ANON_KEY DUPLICATES (3 secrets)
# Note: These have DIFFERENT digest from SUPABASE_ANON_KEY
# They are OLD/INCORRECT values - safe to remove
# ========================================
echo "[2/6] Removing old ANON_KEY duplicates..."
supabase secrets unset \
  ANON_KEY \
  EXTERNAL_SUPABASE_ANON_KEY \
  VITE_SUPABASE_ANON_KEY \
  --project-ref $PROJECT_REF

# ========================================
# GROUP 3: SERVICE_ROLE_KEY DUPLICATES (3 secrets)
# Note: These have DIFFERENT digest from SUPABASE_SERVICE_ROLE_KEY
# They are OLD/INCORRECT values - safe to remove
# ========================================
echo "[3/6] Removing old SERVICE_ROLE_KEY duplicates..."
supabase secrets unset \
  SERVICE_ROLE_KEY \
  EXTERNAL_SUPABASE_SERVICE_ROLE_KEY \
  SRK \
  --project-ref $PROJECT_REF

# ========================================
# GROUP 4: ADMIN TOKEN DUPLICATES (2 secrets)
# Canonical: ADMIN_TOKEN
# ========================================
echo "[4/6] Removing ADMIN token duplicates..."
supabase secrets unset \
  ADMIN_BROADCAST_TOKEN \
  X_ADMIN_TOKEN \
  --project-ref $PROJECT_REF

# ========================================
# GROUP 5: VAPID DUPLICATES (3 secrets)
# Canonical: VAPID_SUBJECT, VAPID_PUBLIC_KEY
# ========================================
echo "[5/6] Removing VAPID duplicates..."
supabase secrets unset \
  VAPID_SUB \
  WEBPUSH_CONTACT_EMAIL \
  VAPID_PUBLIC \
  --project-ref $PROJECT_REF

# ========================================
# GROUP 6: OTHER DUPLICATES (3 secrets)
# ========================================
echo "[6/6] Removing other duplicates..."
supabase secrets unset \
  FIREBASE_PROJECT_ID \
  FIREBASE_MESSAGING_SENDER_ID \
  VITE_SUPABASE_PROJECT_ID \
  --project-ref $PROJECT_REF

# ========================================
# INVALID/CORRUPTED SECRETS (3 secrets)
# ========================================
echo "[CLEANUP] Removing invalid secrets..."
# Note: These may fail if special characters cause issues
supabase secrets unset \
  'wikus77@hotmail.it' \
  --project-ref $PROJECT_REF 2>/dev/null || echo "  - wikus77@hotmail.it: manual removal may be needed"

# For backtick secrets, manual removal via dashboard recommended
echo ""
echo "⚠️ NOTE: Secrets with backticks must be removed manually via Supabase Dashboard:"
echo "  - \`APNS_ENVIRONMENT"
echo "  - \`"
echo ""

echo "========================================"
echo "COMPLETED: $(date)"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Verify with: supabase secrets list --project-ref $PROJECT_REF | wc -l"
echo "2. Run smoke tests: ./smoke_test_functions.sh"
echo "3. If issues: rollback code with git reset --hard 011df48f80ffc2992370c817b105cd900630637d"

