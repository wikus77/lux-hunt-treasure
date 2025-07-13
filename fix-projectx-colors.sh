#!/bin/bash

# Script per correggere automaticamente i colori projectx con m1ssion
# 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™

echo "🔧 FIXING PROJECTX COLOR REFERENCES..."

# Define replacement patterns
declare -A replacements=(
    ["projectx-blue"]="m1ssion-blue"
    ["projectx-pink"]="m1ssion-pink"
    ["projectx-purple"]="m1ssion-purple"
    ["projectx-deep-blue"]="m1ssion-deep-blue"
    ["projectx-neon-blue"]="m1ssion-blue"
    ["projectx-gold"]="yellow-400"
    ["--projectx-blue"]="--m1ssion-blue"
    ["--projectx-pink"]="--m1ssion-pink"
    ["--projectx-purple"]="--m1ssion-purple"
    ["--projectx-gold"]="--yellow-400"
)

# Function to replace in file
replace_in_file() {
    local file="$1"
    local temp_file=$(mktemp)
    
    cp "$file" "$temp_file"
    
    for old_color in "${!replacements[@]}"; do
        new_color="${replacements[$old_color]}"
        sed -i.bak "s/${old_color}/${new_color}/g" "$temp_file" 2>/dev/null || \
        sed -i "s/${old_color}/${new_color}/g" "$temp_file"
    done
    
    # Only update if file changed
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo "✅ Fixed: $file"
    else
        rm "$temp_file"
    fi
}

# Find and fix all TypeScript/TSX files
find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    if grep -q "projectx-" "$file"; then
        replace_in_file "$file"
    fi
done

echo "🔥 ALL PROJECTX COLOR REFERENCES FIXED!"