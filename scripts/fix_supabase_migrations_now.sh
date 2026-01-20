#!/bin/bash
set -euo pipefail

cd /Users/josephmule/lux-hunt-treasure
mkdir -p _logs scripts supabase/migrations_legacy/invalid

echo "== SNAPSHOT =="
date | tee _logs/run_start.txt
supabase --version | tee _logs/supabase_version.txt || true
git status > _logs/git_status.txt 2>&1 || true
ls -la supabase/migrations > _logs/migrations_ls.txt 2>&1 || true
ls -la supabase/migrations_legacy > _logs/migrations_legacy_ls.txt 2>&1 || true

echo "== MOVE MALFORMED LOCAL MIGRATIONS (timestamp-.sql / timestamp_.sql) =="
find supabase/migrations -maxdepth 1 -type f -name "*.sql" 2>/dev/null | while read -r f; do
  bn="$(basename "$f")"
  if echo "$bn" | grep -qE '^[0-9]{14}[-_]\.sql$'; then
    mv -v "$f" supabase/migrations_legacy/invalid/ | tee -a _logs/moved_invalid.txt
  fi
done || true

echo "== TRY DB PULL (CAPTURE ERROR) =="
supabase db pull > _logs/db_pull_1.txt 2>&1 || true

echo "== BUILD REPAIR LIST FROM CLI ERROR (ONLY WHAT CLI ASKED TO REPAIR) =="
grep -Eo '[0-9]{14}' _logs/db_pull_1.txt | sort -u > _logs/versions_to_repair.txt || true
wc -l _logs/versions_to_repair.txt | tee _logs/versions_to_repair_count.txt

if [ ! -s _logs/versions_to_repair.txt ]; then
  echo "NO VERSIONS FOUND IN ERROR. STOP." | tee _logs/stop_no_versions.txt
  exit 1
fi

echo "== REPAIR IN BATCHES OF 25 (MODIFIES REMOTE MIGRATION HISTORY TABLE) =="
rm -f _logs/repair_failed.txt
while read -r batch; do
  [ -z "${batch:-}" ] && continue
  set +e
  supabase migration repair --status reverted $batch > _logs/repair_run_$(date +%Y%m%d%H%M%S).txt 2>&1
  rc=$?
  set -e
  if [ "$rc" -ne 0 ]; then
    echo "$batch" >> _logs/repair_failed.txt
  fi
done < <(paste -sd' ' _logs/versions_to_repair.txt | tr ' ' '\n' | awk '
  {a[NR]=$0}
  END{
    for(i=1;i<=NR;i++){
      printf "%s%s", a[i], (i%25==0 || i==NR) ? "\n" : " "
    }
  }')

echo "== TRY DB PULL AGAIN =="
supabase db pull > _logs/db_pull_2.txt 2>&1 || true

echo "== IF STILL FAILING, EXTRACT NEW VERSIONS AND REPAIR AGAIN =="
grep -Eo '[0-9]{14}' _logs/db_pull_2.txt | sort -u > _logs/versions_to_repair_2.txt || true
comm -23 _logs/versions_to_repair_2.txt _logs/versions_to_repair.txt > _logs/versions_to_repair_delta.txt 2>/dev/null || true

if [ -s _logs/versions_to_repair_delta.txt ]; then
  rm -f _logs/repair_failed_2.txt
  while read -r batch; do
    [ -z "${batch:-}" ] && continue
    set +e
    supabase migration repair --status reverted $batch > _logs/repair_run2_$(date +%Y%m%d%H%M%S).txt 2>&1
    rc=$?
    set -e
    if [ "$rc" -ne 0 ]; then
      echo "$batch" >> _logs/repair_failed_2.txt
    fi
  done < <(paste -sd' ' _logs/versions_to_repair_delta.txt | tr ' ' '\n' | awk '
    {a[NR]=$0}
    END{
      for(i=1;i<=NR;i++){
        printf "%s%s", a[i], (i%25==0 || i==NR) ? "\n" : " "
      }
    }')

  supabase db pull > _logs/db_pull_3.txt 2>&1 || true
fi

echo "== DONE =="
echo "CHECK LOGS:"
echo "  _logs/db_pull_1.txt"
echo "  _logs/db_pull_2.txt"
echo "  _logs/db_pull_3.txt (if created)"
echo "  _logs/repair_failed.txt (if exists)"
echo "  _logs/repair_failed_2.txt (if exists)"
