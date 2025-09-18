#!/usr/bin/env tsx
/**
 * Script to remove BOM (Byte Order Mark) characters from files
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

function removeBOMFromFile(filePath: string): boolean {
  try {
    const buffer = readFileSync(filePath);
    
    // Check for BOM (EF BB BF for UTF-8)
    if (buffer.length >= 3 && 
        buffer[0] === 0xEF && 
        buffer[1] === 0xBB && 
        buffer[2] === 0xBF) {
      
      // Remove BOM by taking slice from position 3
      const contentWithoutBOM = buffer.slice(3);
      writeFileSync(filePath, contentWithoutBOM);
      console.log(`✅ Removed BOM: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🧹 Removing BOM Characters...');
  
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', { 
    ignore: ['**/node_modules/**', '**/dist/**'] 
  });
  
  let fixedFiles = 0;
  
  for (const file of files) {
    if (removeBOMFromFile(file)) {
      fixedFiles++;
    }
  }
  
  console.log(`📊 BOM Fix Summary:`);
  console.log(`   Total files scanned: ${files.length}`);
  console.log(`   Files with BOM removed: ${fixedFiles}`);
  console.log('✅ BOM fixing completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as fixBOM };