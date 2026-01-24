#!/bin/bash
# © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
# DIAGNOSI: Connessione DB Supabase
# Usage: ./scripts/diagnose_db_connection.sh

set -e

PROJECT_REF="vkjrqirvdvjbemsfzxof"
DIRECT_HOST="db.${PROJECT_REF}.supabase.co"
POOLER_HOST="aws-0-eu-central-1.pooler.supabase.com"

echo "🔍 DIAGNOSI CONNESSIONE DB SUPABASE"
echo "===================================="
echo ""

# 1. Check DNS resolution
echo "📡 1. DNS Resolution"
echo "--------------------"

echo "   Direct host ($DIRECT_HOST):"
echo -n "   IPv4 (A): "
dig +short A "$DIRECT_HOST" 2>/dev/null || echo "(nessuno)"
echo -n "   IPv6 (AAAA): "
dig +short AAAA "$DIRECT_HOST" 2>/dev/null || echo "(nessuno)"

echo ""
echo "   Pooler host ($POOLER_HOST):"
echo -n "   IPv4 (A): "
dig +short A "$POOLER_HOST" 2>/dev/null || echo "(nessuno)"
echo -n "   IPv6 (AAAA): "
dig +short AAAA "$POOLER_HOST" 2>/dev/null || echo "(nessuno)"

echo ""

# 2. Check TCP connectivity
echo "📶 2. TCP Connectivity"
echo "----------------------"

echo -n "   Pooler port 6543 (Transaction): "
nc -z -w 3 "$POOLER_HOST" 6543 2>/dev/null && echo "✅ OK" || echo "❌ FAIL"

echo -n "   Pooler port 5432 (Session): "
nc -z -w 3 "$POOLER_HOST" 5432 2>/dev/null && echo "✅ OK" || echo "❌ FAIL"

echo -n "   Direct port 5432: "
nc -z -w 3 "$DIRECT_HOST" 5432 2>/dev/null && echo "✅ OK" || echo "❌ FAIL (IPv6 only)"

echo ""

# 3. Check IPv6 support
echo "🌐 3. IPv6 Support"
echo "------------------"
if ping6 -c 1 -W 2 google.com &>/dev/null; then
  echo "   ✅ IPv6 funzionante (ping6 google.com OK)"
else
  echo "   ⚠️ IPv6 NON funzionante (usa Pooler invece di Direct)"
fi

echo ""

# 4. psql availability
echo "🐘 4. psql Client"
echo "-----------------"
if command -v psql &>/dev/null; then
  echo "   ✅ psql disponibile: $(psql --version | head -1)"
else
  echo "   ❌ psql NON installato"
  echo "   Installa: brew install libpq && brew link --force libpq"
fi

echo ""

# 5. Summary
echo "📋 RIEPILOGO"
echo "============"
echo ""
echo "Se IPv6 NON funziona (come nel tuo caso), usa:"
echo ""
echo "  POOLER CONNECTION STRING:"
echo "  postgresql://postgres.${PROJECT_REF}:<PASSWORD>@${POOLER_HOST}:6543/postgres?sslmode=require"
echo ""
echo "  Comando:"
echo "  read -s DB_PASSWORD && psql \"postgresql://postgres.${PROJECT_REF}:\${DB_PASSWORD}@${POOLER_HOST}:6543/postgres?sslmode=require\""
echo ""
echo "⚠️ Password: vai su Dashboard → Project Settings → Database → Connection String"
echo "   oppure resetta password in Dashboard → Database → Reset database password"
