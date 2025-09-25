#!/usr/bin/env node
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const COPYRIGHT_HEADER = '// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™';
const COPYRIGHT_HEADER_SQL = '-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™';
const COPYRIGHT_HEADER_MD = '<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->';

function addHeaderToFile(filePath, header) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check if header already exists
    if (lines[0].includes('© 2025 Joseph MULÉ') || lines[1]?.includes('© 2025 Joseph MULÉ')) {
      console.log(`✓ Header already exists: ${filePath}`);
      return;
    }
    
    // Add header at the top
    const newContent = header + '\n' + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Added header to: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function processFiles() {
  console.log('🔏 M1SSION™ - Adding copyright headers...\n');
  
  // JavaScript/TypeScript files
  const jsFiles = glob.sync('src/**/*.{js,jsx,ts,tsx}', { ignore: ['**/node_modules/**', '**/dist/**'] });
  jsFiles.forEach(file => addHeaderToFile(file, COPYRIGHT_HEADER));
  
  // Edge function files
  const edgeFiles = glob.sync('supabase/functions/**/*.{js,ts}');
  edgeFiles.forEach(file => addHeaderToFile(file, COPYRIGHT_HEADER));
  
  // SQL files
  const sqlFiles = glob.sync('supabase/migrations/**/*.sql');
  sqlFiles.forEach(file => addHeaderToFile(file, COPYRIGHT_HEADER_SQL));
  
  // Config files
  const configFiles = glob.sync('*.{js,ts,json}', { ignore: ['package*.json', 'node_modules/**'] });
  configFiles.forEach(file => {
    if (file.endsWith('.json')) return; // Skip JSON files
    addHeaderToFile(file, COPYRIGHT_HEADER);
  });
  
  // Markdown files
  const mdFiles = glob.sync('*.md');
  mdFiles.forEach(file => addHeaderToFile(file, COPYRIGHT_HEADER_MD));
  
  console.log('\n🎯 M1SSION™ - Copyright headers processing complete!');
}

processFiles();