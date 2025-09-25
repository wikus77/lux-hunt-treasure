#!/usr/bin/env node
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const COPYRIGHT_HEADER = '// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™';

console.log('🔥 M1SSION™ - Final Cleanup & Hardening Script');
console.log('==================================================\n');

// Remove "Lovable" references
const removeLovabledReferences = () => {
  console.log('🧹 Removing "Lovable" references...');
  
  const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', { ignore: ['**/node_modules/**'] });
  let totalReferences = 0;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Replace Lovable references
      let updatedContent = content
        .replace(/lovable/gi, 'M1SSION')
        .replace(/\/lovable-uploads\//g, '/assets/')
        .replace(/lovableproject\.com/g, 'm1ssion.eu');
      
      // Count references found
      const matches = (originalContent.match(/lovable/gi) || []).length;
      totalReferences += matches;
      
      if (updatedContent !== originalContent) {
        fs.writeFileSync(file, updatedContent);
        console.log(`  ✓ Updated: ${file} (${matches} references)`);
      }
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error.message);
    }
  });
  
  console.log(`📊 Total "Lovable" references removed: ${totalReferences}\n`);
};

// Remove FREE references from BUZZ MAP only
const removeFreeFromBuzzMap = () => {
  console.log('🚫 Removing "FREE" from BUZZ MAP components...');
  
  const buzzMapFiles = [
    'src/components/map/BuzzMapButtonSecure.tsx',
    'src/components/buzz/BuzzMapButtonSecure.tsx',
    'src/hooks/map/useBuzzMapPricing.ts',
    'src/hooks/useBuzzMapPricingNew.ts'
  ];
  
  let totalReferences = 0;
  
  buzzMapFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const originalContent = content;
        
        // Remove FREE references from BUZZ MAP
        let updatedContent = content
          .replace(/FREE|free/g, 'PAID')
          .replace(/gratuito|gratuita/gi, 'a pagamento')
          .replace(/badge.*free/gi, '');
        
        const matches = (originalContent.match(/FREE|free/g) || []).length;
        totalReferences += matches;
        
        if (updatedContent !== originalContent) {
          fs.writeFileSync(file, updatedContent);
          console.log(`  ✓ Updated: ${file} (${matches} FREE references removed)`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${file}:`, error.message);
      }
    }
  });
  
  console.log(`📊 Total "FREE" references removed from BUZZ MAP: ${totalReferences}\n`);
};

// Add copyright headers
const addCopyrightHeaders = () => {
  console.log('©️ Adding copyright headers...');
  
  const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', { ignore: ['**/node_modules/**'] });
  let headersAdded = 0;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      // Check if header already exists
      if (lines[0].includes('© 2025 Joseph MULÉ') || lines[1]?.includes('© 2025 Joseph MULÉ')) {
        return;
      }
      
      // Add header at the top
      const newContent = COPYRIGHT_HEADER + '\n\n' + content;
      fs.writeFileSync(file, newContent, 'utf8');
      headersAdded++;
      console.log(`  ✓ Added header to: ${file}`);
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error.message);
    }
  });
  
  console.log(`📊 Copyright headers added: ${headersAdded}\n`);
};

// Verify critical files exist
const verifyCriticalFiles = () => {
  console.log('🔍 Verifying critical files...');
  
  const criticalFiles = [
    'src/lib/buzzMapPricing.ts',
    'src/hooks/useBuzzMapPricingNew.ts',
    'src/components/map/BuzzMapButtonSecure.tsx',
    'src/components/buzz/BuzzButton.tsx',
    'supabase/functions/handle-buzz-press/index.ts',
    'supabase/functions/create-payment-intent/index.ts'
  ];
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ MISSING: ${file}`);
    }
  });
  
  console.log('');
};

// Main execution
try {
  removeLovabledReferences();
  removeFreeFromBuzzMap();
  addCopyrightHeaders();
  verifyCriticalFiles();
  
  console.log('🎯 M1SSION™ - Final cleanup completed successfully!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('  1. Run: pnpm run build');
  console.log('  2. Deploy: supabase functions deploy handle-buzz-press');
  console.log('  3. Test E2E payments');
  console.log('');
  
} catch (error) {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
}