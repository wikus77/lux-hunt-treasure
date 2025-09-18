#!/usr/bin/env tsx
/**
 * M1SSION™ PWA - Import Statement Fixer
 * Fixes common import issues and ensures proper module resolution
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

interface ImportFix {
  from: string;
  to: string;
  description: string;
}

const IMPORT_FIXES: ImportFix[] = [
  {
    from: 'import\\s+\\{([^}]+)\\}\\s+from\\s+["\']@/lib/utils["\'];?',
    to: 'import { $1 } from "@/lib/utils";',
    description: 'Standardize utils imports'
  },
  {
    from: 'import\\s+React\\s*,\\s*\\{([^}]+)\\}\\s+from\\s+["\']react["\'];?',
    to: 'import React, { $1 } from "react";',
    description: 'Standardize React imports'
  },
  {
    from: 'import\\s+\\{([^}]+)\\}\\s+from\\s+["\']react["\'];?',
    to: 'import { $1 } from "react";',
    description: 'Clean React hook imports'
  }
];

function fixImportsInFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const fix of IMPORT_FIXES) {
      const regex = new RegExp(fix.from, 'g');
      const before = content;
      content = content.replace(regex, fix.to);
      
      if (before !== content) {
        modified = true;
      }
    }

    // Remove duplicate imports
    const lines = content.split('\n');
    const seenImports = new Set<string>();
    const cleanedLines = lines.filter(line => {
      if (line.trim().startsWith('import ')) {
        if (seenImports.has(line.trim())) {
          modified = true;
          return false;
        }
        seenImports.add(line.trim());
      }
      return true;
    });

    if (modified) {
      writeFileSync(filePath, cleanedLines.join('\n'), 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing imports in ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔧 M1SSION™ - Fixing Import Statements...');
  
  const files = await glob('src/**/*.{ts,tsx}', { 
    ignore: ['**/node_modules/**', '**/dist/**', '**/types.ts'] 
  });
  
  let totalFiles = 0;
  let fixedFiles = 0;
  
  for (const file of files) {
    totalFiles++;
    if (fixImportsInFile(file)) {
      fixedFiles++;
      console.log(`✅ Fixed imports: ${file}`);
    }
  }
  
  console.log(`\n📊 Import Fix Summary:`);
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files with fixed imports: ${fixedFiles}`);
  console.log('✅ Import fixing completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as fixImports };