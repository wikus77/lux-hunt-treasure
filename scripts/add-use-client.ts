#!/usr/bin/env tsx
/**
 * Script to add "use client" directive to React component files that need it
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Patterns that indicate a file needs "use client"
const NEEDS_USE_CLIENT_PATTERNS = [
  /\b(useState|useEffect|useMemo|useCallback|useReducer|useContext|useRef|useLayoutEffect)\s*\(/,
  /\bsetState\s*\(/,
  /\bevent\.(preventDefault|stopPropagation)\s*\(/,
  /\bonClick|onChange|onSubmit|onFocus|onBlur\s*=/,
];

function needsUseClient(content: string): boolean {
  // Check if it's a React component file with hooks or event handlers
  const hasReactImport = /import.*React.*from\s+['"]react['"]/.test(content);
  const hasHooksImport = /import.*\{[^}]*(?:useState|useEffect|useMemo|useCallback)[^}]*\}.*from\s+['"]react['"]/.test(content);
  const hasJSX = /<\w+[^>]*>/.test(content);
  
  if (!hasReactImport && !hasHooksImport && !hasJSX) {
    return false;
  }
  
  return NEEDS_USE_CLIENT_PATTERNS.some(pattern => pattern.test(content));
}

function addUseClientDirective(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Skip if already has "use client"
    if (content.includes('"use client"') || content.includes("'use client'")) {
      return false;
    }
    
    // Skip if doesn't need "use client"
    if (!needsUseClient(content)) {
      return false;
    }
    
    // Find first import or first non-comment line
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Skip initial comments and empty lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        continue;
      }
      insertIndex = i;
      break;
    }
    
    // Insert "use client" directive
    lines.splice(insertIndex, 0, '"use client";', '');
    const newContent = lines.join('\n');
    
    writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✅ Added "use client" to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
  return false;
}

async function main() {
  console.log('🔧 Adding "use client" directives to React components...');
  
  const files = await glob('src/**/*.{ts,tsx}', { 
    ignore: ['**/node_modules/**', '**/dist/**'] 
  });
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (addUseClientDirective(file)) {
      fixedCount++;
    }
  }
  
  console.log(`✅ Added "use client" to ${fixedCount} files`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}