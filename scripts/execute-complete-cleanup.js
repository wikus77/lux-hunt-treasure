#!/usr/bin/env node
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧹 M1SSION™ - Executing COMPLETE cleanup...\n');

// Find all files to process
const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/dist/**'] 
});

let totalChanges = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    let fileChanges = 0;

    // Remove FREE-related patterns ONLY from BUZZ MAP components, preserve FREE for BUZZ
    const freePatterns = [
      // Only remove FREE from BUZZ MAP related files
      /free_remaining\s*[:=][^,};\n]*/g,
      /FREE_OVERRIDE[^,};\n]*/g,
      /consume_free_buzz[^,};\n]*/g,
      /buzzOverride\.free_remaining[^,};\n]*/g,
      /overrideFree[^,};\n]*/g
    ];

    // Only apply FREE removal to BUZZ MAP files, not general BUZZ files
    if (file.includes('BuzzMap') || file.includes('buzz-map')) {
      freePatterns.forEach(pattern => {
        const matches = newContent.match(pattern);
        if (matches) {
          fileChanges += matches.length;
          newContent = newContent.replace(pattern, '');
        }
      });
    }

    // Replace Lovable image paths and references
    const lovablePatterns = [
      { pattern: /\/lovable-uploads\//g, replacement: '/assets/' },
      { pattern: /lovable\.app/gi, replacement: 'M1SSION.app' },
      { pattern: /lovableproject\.com/gi, replacement: 'M1SSION.com' },
      { pattern: /Lovable/g, replacement: 'M1SSION' },
      { pattern: /LOVABLE/g, replacement: 'M1SSION' }
    ];

    lovablePatterns.forEach(({ pattern, replacement }) => {
      const matches = newContent.match(pattern);
      if (matches) {
        fileChanges += matches.length;
        newContent = newContent.replace(pattern, replacement);
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

console.log(`\n🎯 M1SSION™ - Fixed ${totalChanges} issues across ${files.length} files!`);