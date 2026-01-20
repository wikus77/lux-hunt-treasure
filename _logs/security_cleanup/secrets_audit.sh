#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="vkjrqirvdvjbemsfzxof"
OUT_DIR="_logs/security_cleanup"
SECRETS_TXT="$OUT_DIR/secrets_list.txt"
USAGE_MD="$OUT_DIR/SECRETS_USAGE_REPORT.md"
DUP_MD="$OUT_DIR/SECRETS_DUPLICATES_REPORT.md"
CAND_TXT="$OUT_DIR/candidates_unset_low_risk.txt"

echo "== Refresh secrets list =="
supabase secrets list --project-ref "$PROJECT_REF" > "$SECRETS_TXT"

echo "== Build name list =="
NAMES_FILE="$OUT_DIR/secrets_names.txt"
awk -F'|' 'NR>2 && $1 ~ /[A-Za-z0-9_`@.]/ {gsub(/^[[:space:]]+|[[:space:]]+$/,"",$1); if($1!="NAME" && $1!="") print $1}' "$SECRETS_TXT" > "$NAMES_FILE"

echo "== Usage scan (repo + supabase/functions) =="
{
  echo "# SECRETS USAGE REPORT"
  echo ""
  echo "- Project ref: $PROJECT_REF"
  echo "- Generated: $(date)"
  echo ""
  echo "## How to read"
  echo "- 'repo_hits' counts matches across the whole repo"
  echo "- 'functions_hits' counts matches under supabase/functions"
  echo ""
  echo "## Usage table"
  echo ""
  echo "| secret | repo_hits | functions_hits | examples |"
  echo "|---|---:|---:|---|"
} > "$USAGE_MD"

while IFS= read -r s; do
  repo_hits=$(rg -uuu -n --fixed-strings "$s" . 2>/dev/null | wc -l | tr -d ' ')
  func_hits=$(rg -uuu -n --fixed-strings "$s" supabase/functions 2>/dev/null | wc -l | tr -d ' ')
  examples=$(rg -uuu -n --fixed-strings "$s" supabase/functions 2>/dev/null | head -n 2 | sed 's/|/\\|/g' | tr '\n' ';' || true)
  printf "| %s | %s | %s | %s |\n" "$s" "$repo_hits" "$func_hits" "${examples:-"-"}" >> "$USAGE_MD"
done < "$NAMES_FILE"

echo "== Duplicates by digest (same value in multiple secret names) =="
awk -F'|' 'NR>2 {gsub(/^[[:space:]]+|[[:space:]]+$/,"",$1); gsub(/^[[:space:]]+|[[:space:]]+$/,"",$2); if($1!="" && $1!="NAME" && $2!="") print $2 "|" $1}' "$SECRETS_TXT" \
  | sort \
  | awk -F'|' '
    {
      d=$1; n=$2;
      if(d==prev){names=names "," n; cnt++} else {
        if(prev!="" && cnt>1) print prev "|" names;
        prev=d; names=n; cnt=1
      }
    }
    END{ if(prev!="" && cnt>1) print prev "|" names }
  ' > "$OUT_DIR/duplicates_by_digest.txt"

{
  echo "# SECRETS DUPLICATES REPORT"
  echo ""
  echo "- Project ref: $PROJECT_REF"
  echo "- Generated: $(date)"
  echo ""
  echo "## Duplicates (same digest => same value)"
  echo ""
  echo "| digest | names |"
  echo "|---|---|"
  awk -F'|' '{printf "| %s | %s |\n",$1,$2}' "$OUT_DIR/duplicates_by_digest.txt"
  echo ""
  echo "## Low-risk candidates (heuristic)"
  echo "- This file is only a *candidate list*. Final decision must be based on usage hits."
  echo ""
} > "$DUP_MD"

echo "== Build LOW RISK candidate list from known patterns + duplicates =="
: > "$CAND_TXT"

# heuristics: duplicates with likely alias names we can drop (keep the canonical one)
# We only output names that appear in duplicates_by_digest.txt, and prefer removing aliases like X_*, EXTERNAL_*, SRK, URL, SB_URL, etc.
python3 - <<'PY'
import re, pathlib
dup = pathlib.Path("_logs/security_cleanup/duplicates_by_digest.txt").read_text().splitlines()
cands=set()
for line in dup:
    if "|" not in line: 
        continue
    digest, names = line.split("|",1)
    ns = [n.strip() for n in names.split(",") if n.strip()]
    # mark likely alias names as removal candidates
    for n in ns:
        if n.startswith("X_") or n.startswith("EXTERNAL_") or n in {"SRK","URL","SB_URL","ANON_KEY","KEY"} or n.endswith("_KEY") and n.startswith("VITE_"):
            cands.add(n)
        if n.startswith("`") or n.endswith("`"):
            cands.add(n)
        if "@" in n:
            cands.add(n)
# write
out = "\n".join(sorted(cands))
pathlib.Path("_logs/security_cleanup/candidates_unset_low_risk.txt").write_text(out + ("\n" if out else ""))
PY

echo "== Done =="
echo "USAGE: $USAGE_MD"
echo "DUP:   $DUP_MD"
echo "CAND:  $CAND_TXT"
