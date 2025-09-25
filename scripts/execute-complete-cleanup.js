#!/usr/bin/env node
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🛡️ M1SSION™ - COMPLETE SYSTEM HARDENING...\n');

// Find all files to clean
const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/dist/**'] 
});

let totalChanges = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    let fileChanges = 0;

    // Remove ALL FREE-related patterns (complete list)
    const freePatterns = [
      /free_remaining\s*[:=][^,};\n]*/g,
      /FREE_OVERRIDE[^,};\n]*/g,
      /consume_free_buzz[^,};\n]*/g,
      /consumeFreeBuzz[^,};\n]*/g,
      /hasFreeBuzz[^,};\n]*/g,
      /freeAvailable[^,};\n]*/g,
      /buzzOverride\.free_remaining[^,};\n]*/g,
      /FREE\s+\d+/g,
      /'FREE'/g,
      /"FREE"/g,
      /overrideFree[^,};\n]*/g,
      /redeemFreeBuzz[^,};\n]*/g,
      /processedFree[^,};\n]*/g,
      /removeFreeQueryParams[^,};\n]*/g,
      /\?free=1/g,
      /&free=1/g,
      /free=1&/g,
      /isFree[^,};\n]*/g,
      /FREE_\w+/g,
      /BUZZ_FREE/g,
      /buzz_free/g,
      /'free'/g,
      /"free"/g,
      /FREE BUZZ/g,
      /Free BUZZ/g,
      /GRATIS/g,
      /gratuito/g,
      /Gratuiti/g,
      /GRATUITO/g,
      /Plan.*Free/g,
      /tier.*free/g,
      /\.free[^a-zA-Z]/g
    ];

    freePatterns.forEach(pattern => {
      const matches = newContent.match(pattern);
      if (matches) {
        fileChanges += matches.length;
        newContent = newContent.replace(pattern, '');
      }
    });

    // Clean up Lovable references
    const lovablePatterns = [
      /\/lovable-uploads\//g,
      /lovable/gi,
      /Lovable/g
    ];

    lovablePatterns.forEach(pattern => {
      const matches = newContent.match(pattern);
      if (matches) {
        fileChanges += matches.length;
        newContent = newContent.replace(/\/lovable-uploads\//g, '/assets/');
        newContent = newContent.replace(/lovable/gi, 'M1SSION');
        newContent = newContent.replace(/Lovable/g, 'M1SSION');
      }
    });

    // Clean up syntax issues
    newContent = newContent
      .replace(/,\s*,/g, ',')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*\)/g, ')')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\s+$/gm, ''); // Remove trailing whitespace

    if (fileChanges > 0) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`✓ Cleaned ${fileChanges} issues in: ${file}`);
      totalChanges += fileChanges;
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log(`\n🎯 M1SSION™ - Complete cleanup: ${totalChanges} issues fixed across ${files.length} files!`);