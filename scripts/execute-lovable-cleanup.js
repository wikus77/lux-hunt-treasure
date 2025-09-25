#!/usr/bin/env node
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧹 M1SSION™ - Cleaning ALL LOVABLE references...\n');

// Find all files with LOVABLE references
const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/dist/**'] 
});

let totalChanges = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    let fileChanges = 0;

    // Replace Lovable image paths with local assets
    const lovableImagePattern = /\/lovable-uploads\//g;
    const matches = newContent.match(lovableImagePattern);
    if (matches) {
      fileChanges += matches.length;
      newContent = newContent.replace(lovableImagePattern, '/assets/');
    }

    // Replace Lovable references in text
    const lovableTextPatterns = [
      /lovable\.app/gi,
      /lovableproject\.com/gi,
      /Lovable/g,
      /LOVABLE/g
    ];

    lovableTextPatterns.forEach(pattern => {
      const textMatches = newContent.match(pattern);
      if (textMatches) {
        fileChanges += textMatches.length;
        newContent = newContent.replace(pattern, 'M1SSION');
      }
    });

    // Clean up any remaining references
    newContent = newContent
      .replace(/edit in lovable/gi, 'edit in M1SSION')
      .replace(/built with lovable/gi, 'built with M1SSION')
      .replace(/powered by lovable/gi, 'powered by M1SSION');

    if (fileChanges > 0) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`✓ Cleaned ${fileChanges} LOVABLE references in: ${file}`);
      totalChanges += fileChanges;
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log(`\n🎯 M1SSION™ - Cleaned ${totalChanges} LOVABLE references across ${files.length} files!`);