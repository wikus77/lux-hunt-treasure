#!/bin/bash
# © 2026 M1SSION Security Cleanup - AUDIT SCRIPT
#
# Generates comprehensive secrets audit report

PROJECT_REF="vkjrqirvdvjbemsfzxof"
OUTPUT_DIR="_logs/security_cleanup"

echo "========================================"
echo "M1SSION SECRETS AUDIT"
echo "========================================"
echo "Project: $PROJECT_REF"
echo "Date: $(date)"
echo ""

# Create output directory
mkdir -p $OUTPUT_DIR

# 1. Get current secrets list
echo "[1/4] Fetching secrets list..."
supabase secrets list --project-ref $PROJECT_REF > $OUTPUT_DIR/secrets_list.txt 2>&1

# 2. Extract names only
echo "[2/4] Extracting secret names..."
cat $OUTPUT_DIR/secrets_list.txt | grep -v "NAME\|---" | awk -F'|' '{gsub(/^ +| +$/, "", $1); print $1}' | grep -v "^$" > $OUTPUT_DIR/secrets_names.txt

# 3. Count
TOTAL=$(wc -l < $OUTPUT_DIR/secrets_names.txt | tr -d ' ')
echo "   Total secrets: $TOTAL"

# 4. Find duplicates by digest
echo "[3/4] Analyzing duplicates..."
cat $OUTPUT_DIR/secrets_list.txt | grep -v "NAME\|---" | \
  awk -F'|' '{gsub(/^ +| +$/, "", $1); gsub(/^ +| +$/, "", $2); if($2 != "") print $2 "\t" $1}' | \
  sort | \
  awk -F'\t' '
  {
    digest=$1
    name=$2
    names[digest] = names[digest] (names[digest] ? ", " : "") name
    count[digest]++
  }
  END {
    for(d in count) {
      if(count[d] > 1) {
        print count[d] " duplicates: " names[d]
      }
    }
  }' | sort -rn > $OUTPUT_DIR/duplicates_summary.txt

# 5. Usage scan
echo "[4/4] Scanning code for usage..."
echo "Secret,Occurrences,Status" > $OUTPUT_DIR/usage_matrix.csv
while read secret; do
  count=$(grep -rw "\"$secret\"" supabase/functions/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt "0" ]; then
    status="USED"
  else
    status="UNUSED"
  fi
  echo "$secret,$count,$status" >> $OUTPUT_DIR/usage_matrix.csv
done < $OUTPUT_DIR/secrets_names.txt

echo ""
echo "========================================"
echo "AUDIT COMPLETE"
echo "========================================"
echo ""
echo "Output files:"
echo "  - $OUTPUT_DIR/secrets_list.txt"
echo "  - $OUTPUT_DIR/secrets_names.txt"
echo "  - $OUTPUT_DIR/duplicates_summary.txt"
echo "  - $OUTPUT_DIR/usage_matrix.csv"
echo ""
echo "Total secrets: $TOTAL"
echo "Duplicates found: $(wc -l < $OUTPUT_DIR/duplicates_summary.txt | tr -d ' ') groups"

