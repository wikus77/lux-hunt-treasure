#!/usr/bin/env bash
set -Eeuo pipefail

DIR="${1:-supabase/migrations}"
OUT="${OUT:-/tmp/migrations_audit_$(date +%Y%m%d_%H%M%S).md}"

[[ -d "$DIR" ]] || { echo "ERROR: directory not found: $DIR" >&2; exit 2; }

tmp_ls="$(mktemp)"
tmp_all="$(mktemp)"
tmp_nonstub="$(mktemp)"
tmp_badprefix="$(mktemp)"
tmp_tiny="$(mktemp)"
trap 'rm -f "$tmp_ls" "$tmp_all" "$tmp_nonstub" "$tmp_badprefix" "$tmp_tiny"' EXIT

# precompute lists (NO PIPE -> no broken pipe)
ls -1 "$DIR" > "$tmp_all" 2>/dev/null || true
grep -E '\.sql$' "$tmp_all" > "$tmp_all.sql" 2>/dev/null || true
grep -E '\.sql$' "$tmp_all" | grep -vE '_remote_stub\.sql$|_remote_history_stub\.sql$' > "$tmp_nonstub" 2>/dev/null || true
grep -E '\.sql$' "$tmp_all" | grep -vE '^[0-9]{8}_|^[0-9]{14}_' > "$tmp_badprefix" 2>/dev/null || true
find "$DIR" -maxdepth 1 -type f -name '*.sql' -size -60c -print > "$tmp_tiny" 2>/dev/null || true

total="$(wc -l < "$tmp_all.sql" | tr -d ' ')"
stub_remote="$(grep -E '_remote_stub\.sql$' "$tmp_all.sql" | wc -l | tr -d ' ')"
stub_history="$(grep -E '_remote_history_stub\.sql$' "$tmp_all.sql" | wc -l | tr -d ' ')"

# mtime list: write full, then take first 60 lines from file (no SIGPIPE)
ls -lht "$DIR" > "$tmp_ls" 2>/dev/null || true

{
  echo "# Supabase migrations audit"
  echo
  echo "- dir: \`$DIR\`"
  echo "- generated: \`$(date -Iseconds)\`"
  echo "- total .sql: **$total**"
  echo "- *_remote_stub.sql: **$stub_remote**"
  echo "- *_remote_history_stub.sql: **$stub_history**"
  echo

  echo "## Latest 60 files (mtime)"
  echo
  echo '```'
  sed -n '1,60p' "$tmp_ls" || true
  echo '```'
  echo

  echo "## Largest 40 files"
  echo
  echo '```'
  (cd "$DIR" && ls -lhS *.sql 2>/dev/null > /tmp/_largest_sql.txt && sed -n '1,40p' /tmp/_largest_sql.txt) || true
  echo '```'
  echo

  echo "## Stub files (top 80 by name)"
  echo
  echo '```'
  grep -E '_remote_stub\.sql$|_remote_history_stub\.sql$' "$tmp_all.sql" | sed -n '1,80p' || true
  echo '```'
  echo

  echo "## Non-stub migrations (top 80 by name)"
  echo
  echo '```'
  sed -n '1,80p' "$tmp_nonstub" || true
  echo '```'
  echo

  echo "## Potential issues"
  echo
  echo "### Duplicate numeric prefixes (first 8 digits) among non-stub files"
  echo
  echo '```'
  awk -F_ '{print substr($1,1,8),$0}' "$tmp_nonstub" \
    | sort \
    | awk '{cnt[$1]++; files[$1]=files[$1]"\n  "$2} END{for(k in cnt) if(cnt[k]>1) print k " (" cnt[k] "):" files[k] "\n"}' \
    || true
  echo '```'
  echo

  echo "### Files not matching expected prefix pattern (YYYYMMDD or 14-digit timestamp)"
  echo
  echo '```'
  cat "$tmp_badprefix" || true
  echo '```'
  echo

  echo "### Empty or tiny .sql files (<= 60 bytes)"
  echo
  echo '```'
  sed 's|^| - |' "$tmp_tiny" || true
  echo '```'
  echo

  echo "### 20 most recent git-tracked changes under migrations (if repo)"
  echo
  echo '```'
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git log -n 20 --pretty=format:'%h %ad %s' --date=short -- "$DIR" || true
  else
    echo "not a git repo"
  fi
  echo '```'
  echo
} > "$OUT"

echo "$OUT"
echo "----"
sed -n '1,160p' "$OUT"
