#!/usr/bin/env tsx
/**
 * Script to remove BOM (Byte Order Mark) from TypeScript/React files
 * Avoids shell command line length limits by processing files individually
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

function removeBomFromFile(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check if file starts with BOM (U+FEFF)
    if (content.charCodeAt(0) === 0xFEFF) {
      const cleanContent = content.slice(1);
      writeFileSync(filePath, cleanContent, 'utf-8');
      console.log(`Removed BOM from: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
  return false;
}

async function main() {
  console.log('🧹 Removing BOM from TypeScript/React files...');
  
  // Find all TypeScript/React files
  const files = await glob('src/**/*.{ts,tsx}', { 
    ignore: ['**/node_modules/**', '**/dist/**'] 
  });
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (removeBomFromFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Removed BOM from ${fixedCount} files`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}