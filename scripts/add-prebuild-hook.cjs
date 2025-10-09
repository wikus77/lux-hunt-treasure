#!/usr/bin/env node
/**
 * M1SSION™ - Safe Prebuild Hook Installer
 * © 2025 Joseph MULÉ - NIYVORA KFT™
 * 
 * SAFE MODE: This script only adds the prebuild hook to package.json
 * without modifying any other fields. Idempotent and safe to run multiple times.
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const PREBUILD_SCRIPT = 'node scripts/push-guard.cjs';

try {
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  
  // Ensure scripts object exists
  packageJson.scripts = packageJson.scripts || {};
  
  // Add prebuild hook (idempotent)
  packageJson.scripts.prebuild = PREBUILD_SCRIPT;
  
  // Write back to package.json with proper formatting
  fs.writeFileSync(
    PACKAGE_JSON_PATH,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  );
  
  console.log('✅ prebuild hook added to package.json');
  console.log('📋 Hook command: ' + PREBUILD_SCRIPT);
  console.log('🔒 Push Guard will now run automatically before every build');
  console.log('\n💡 Test it now with: pnpm run build');
} catch (error) {
  console.error('❌ Failed to add prebuild hook:', error.message);
  process.exit(1);
}
