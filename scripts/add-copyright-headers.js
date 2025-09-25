#!/usr/bin/env node
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const COPYRIGHT_HEADER = '// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™';

function addHeaderToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check if header already exists
    if (lines[0].includes('© 2025 Joseph MULÉ') || lines[1]?.includes('© 2025 Joseph MULÉ')) {
      console.log(`✓ Header already exists: ${filePath}`);
      return;
    }
    
    // Add header at the top
    const newContent = COPYRIGHT_HEADER + '\n\n' + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Added header to: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('🔏 M1SSION™ - Adding copyright headers...\n');

// JavaScript/TypeScript files
const jsFiles = glob.sync('src/**/*.{js,jsx,ts,tsx}', { ignore: ['**/node_modules/**', '**/dist/**'] });
jsFiles.forEach(file => addHeaderToFile(file));

// Edge function files
const edgeFiles = glob.sync('supabase/functions/**/*.{js,ts}');
edgeFiles.forEach(file => addHeaderToFile(file));

console.log('\n🎯 M1SSION™ - Copyright headers processing complete!');