#!/usr/bin/env node
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧹 M1SSION™ - Executing full cleanup...\n');

// Find all files with FREE references  
const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/dist/**'] 
});

let totalChanges = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    let fileChanges = 0;

    // Remove FREE-related patterns
    const freePatterns = [
      /free_remaining\s*[:=][^,};\n]*/g,
      /FREE_OVERRIDE[^,};\n]*/g,
      /consume_free_buzz[^,};\n]*/g,
      /buzzOverride\.free_remaining[^,};\n]*/g,
      /hasFreeBuzz[^,};\n]*/g,
      /consumeFreeBuzz[^,};\n]*/g,
      /freeAvailable[^,};\n]*/g,
      /FREE\s+\d+/g,
      /'FREE'/g,
      /"FREE"/g,
      /FREE\s*{[^}]*}/g,
      /if\s*\([^)]*free[^)]*\)\s*{[^}]*}/gi,
      /\?\s*'FREE'\s*:/g,
      /overrideFree[^,};\n]*/g,
      /buzzOverride[^,};\n]*/g,
      /useBuzzGrants[^,};\n]*/g
    ];

    freePatterns.forEach(pattern => {
      const matches = newContent.match(pattern);
      if (matches) {
        fileChanges += matches.length;
        newContent = newContent.replace(pattern, '');
      }
    });

    // Replace Lovable image paths
    newContent = newContent.replace(/\/lovable-uploads\//g, '/assets/');

    // Clean up syntax
    newContent = newContent
      .replace(/,\s*,/g, ',')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*\)/g, ')')
      .replace(/\n\s*\n\s*\n/g, '\n\n');

    if (fileChanges > 0) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`✓ Cleaned ${fileChanges} issues in: ${file}`);
      totalChanges += fileChanges;
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log(`\n🎯 M1SSION™ - Cleaned ${totalChanges} issues across ${files.length} files!`);