#!/usr/bin/env tsx
/**
 * Script to fix broken import statements in TypeScript/React files
 * Fixes patterns where 'import {' is missing from the beginning of import blocks
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

// Pattern to match broken imports - lines that end with } from but don't start with import
const brokenImportPattern = /^(\s*)([A-Za-z][A-Za-z0-9_,\s\n]*?)(\} from ['"][^'"]*['"];?)$/gm;

function fixFileImports(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    let fixed = false;
    
    // Split into lines for better processing
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Check if this line starts with an identifier and might be a broken import
      if (/^  [A-Z][A-Za-z0-9_]*,?\s*$/.test(line) && i > 0) {
        // Look back to see if previous lines suggest this is in an import context
        let prevIndex = i - 1;
        while (prevIndex >= 0 && (lines[prevIndex].trim() === '' || /^  [A-Z]/.test(lines[prevIndex]))) {
          prevIndex--;
        }
        
        // Look forward to find the closing } from
        let hasFromClause = false;
        let endIndex = i;
        for (let j = i; j < lines.length && j < i + 20; j++) {
          if (lines[j].includes('} from')) {
            hasFromClause = true;
            endIndex = j;
            break;
          }
        }
        
        if (hasFromClause && (prevIndex < 0 || !lines[prevIndex].includes('import'))) {
          // This looks like a broken import block - collect all lines
          const importLines = [];
          let startIndex = i;
          
          // Find the actual start of the import block
          while (startIndex > 0 && (/^  [A-Z]/.test(lines[startIndex - 1]) || lines[startIndex - 1].trim() === '')) {
            if (/^  [A-Z]/.test(lines[startIndex - 1])) {
              startIndex--;
            } else {
              break;
            }
          }
          
          // Collect the import content
          for (let k = startIndex; k <= endIndex; k++) {
            importLines.push(lines[k]);
          }
          
          // Create the fixed import statement
          const indent = importLines[0].match(/^(\s*)/)[1];
          const importContent = importLines.map(l => l.trim()).join(' ');
          const fixedImport = `${indent}import { ${importContent}`;
          
          newLines.push(fixedImport);
          console.log(`Fixed broken import in ${filePath}`);
          fixed = true;
          
          // Skip the processed lines
          i = endIndex;
          continue;
        }
      }
      
      newLines.push(line);
    }
    
    const newContent = newLines.join('\n');
    
    if (fixed && newContent !== content) {
      writeFileSync(filePath, newContent, 'utf-8');
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
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