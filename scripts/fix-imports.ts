#!/usr/bin/env tsx
/**
 * Script to fix broken import statements in TypeScript/React files
 * Fixes patterns where 'import {' is missing from the beginning of import blocks
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

// Pattern to match broken imports (lines with identifiers ending with } from)
const brokenImportPattern = /^(\s*)([A-Za-z][A-Za-z0-9_,\s]*\n[\s\S]*?)(\} from ['"][^'"]*['"];?)$/gm;

function fixFileImports(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    let fixed = false;
    
    // Look for broken import patterns
    const newContent = content.replace(brokenImportPattern, (match, indent, importBody, fromClause) => {
      // Check if this looks like a broken import (no 'import' keyword at start)
      if (!importBody.trim().startsWith('import') && fromClause.includes('} from')) {
        console.log(`Fixing broken import in ${filePath}`);
        fixed = true;
        return `${indent}import { ${importBody.trim()}${fromClause}`;
      }
      return match;
    });
    
    if (fixed && newContent !== content) {
      writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
  return false;
}

async function main() {
  console.log('🔧 Fixing broken import statements...');
  
  // Find all TypeScript/React files
  const files = await glob('src/**/*.{ts,tsx}', { 
    ignore: ['**/node_modules/**', '**/dist/**'] 
  });
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixFileImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed ${fixedCount} files with broken imports`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}