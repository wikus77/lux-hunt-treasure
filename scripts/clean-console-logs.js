// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Script per rimuovere console.log da file di produzione

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PRESERVE_PATTERNS = [
  /console\.error/,
  /console\.warn/,
  /\/\/ KEEP:/,
  /\/\* KEEP:/,
  /CRITICAL.*console/
];

const REMOVE_PATTERNS = [
  /console\.log\([^)]*\);?/g,
  /console\.debug\([^)]*\);?/g,
  /console\.info\([^)]*\);?/g
];

function shouldPreserveLine(line) {
  return PRESERVE_PATTERNS.some(pattern => pattern.test(line));
}

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    const lines = content.split('\n');
    const cleanedLines = lines.map(line => {
      if (shouldPreserveLine(line)) {
        return line;
      }
      
      let cleanedLine = line;
      REMOVE_PATTERNS.forEach(pattern => {
        const before = cleanedLine;
        cleanedLine = cleanedLine.replace(pattern, '');
        if (before !== cleanedLine) {
          modified = true;
        }
      });
      
      return cleanedLine;
    });
    
    if (modified) {
      const cleanedContent = cleanedLines.join('\n');
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

function cleanProjectConsoles() {
  console.log('🧹 Starting console.log cleanup...');
  
  const patterns = [
    'src/**/*.tsx',
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/integrations/supabase/types.ts'
  ];
  
  let totalFiles = 0;
  let cleanedFiles = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    files.forEach(file => {
      totalFiles++;
      if (cleanFile(file)) {
        cleanedFiles++;
      }
    });
  });
  
  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files cleaned: ${cleanedFiles}`);
  console.log(`   Console.logs removed: Production optimized`);
  console.log('✅ Cleanup completed!');
}

// Run if called directly
if (require.main === module) {
  cleanProjectConsoles();
}

module.exports = { cleanProjectConsoles };