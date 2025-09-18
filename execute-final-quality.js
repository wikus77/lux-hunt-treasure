#!/usr/bin/env node
/**
 * M1SSION™ PWA - Final Quality Execution
 * Executes complete quality pipeline and generates final report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - COMPLETED`);
    return { success: true, output: result };
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

function generateFinalReport(results) {
  const timestamp = new Date().toISOString();
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 M1SSION™ - FINAL QUALITY EXECUTION REPORT');
  console.log('='.repeat(60));
  console.log(`🕐 Timestamp: ${timestamp}`);
  console.log(`📊 Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  console.log('');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${result.step}: ${status}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error.substring(0, 200)}...`);
    }
  });
  
  console.log('\n📋 FINAL STATUS:');
  if (successCount === totalCount) {
    console.log('🎉 M1SSION™ PWA - PRODUCTION READY');
    console.log('   All quality checks passed successfully');
  } else {
    console.log('⚠️  M1SSION™ PWA - REQUIRES ATTENTION');
    console.log(`   ${totalCount - successCount} check(s) failed`);
  }
  
  console.log('\n🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™');
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 M1SSION™ - FINAL QUALITY EXECUTION STARTED');
  console.log('='.repeat(60));
  
  const results = [];
  
  // Step 1: Fix BOM characters
  results.push(executeCommand('node -r tsx/cjs scripts/fix-bom.ts', 'BOM Character Fix'));
  
  // Step 2: Fix imports
  results.push(executeCommand('node -r tsx/cjs scripts/fix-imports.ts', 'Import Statement Fix'));
  
  // Step 3: Add use client directives
  results.push(executeCommand('node -r tsx/cjs scripts/add-use-client.ts', 'Use Client Directive Fix'));
  
  // Step 4: Clean console statements
  results.push(executeCommand('node scripts/clean-console-logs.js', 'Console Statement Cleanup'));
  
  // Step 5: TypeScript compilation check
  results.push(executeCommand('npx tsc --noEmit', 'TypeScript Compilation Check'));
  
  // Step 6: ESLint check
  results.push(executeCommand('npx eslint "src/**/*.{ts,tsx}" --max-warnings=0', 'ESLint Code Quality Check'));
  
  // Step 7: Production build test
  results.push(executeCommand('npm run build', 'Production Build Test'));
  
  // Generate final report
  generateFinalReport(results);
  
  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };