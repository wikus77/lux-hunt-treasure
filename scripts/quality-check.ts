#!/usr/bin/env tsx
/**
 * M1SSION™ PWA - Quality Check Script
 * Comprehensive code quality validation
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface QualityResult {
  step: string;
  success: boolean;
  output: string;
  errors: string;
}

async function runQualityCheck(command: string, description: string): Promise<QualityResult> {
  try {
    console.log(`🔍 ${description}...`);
    const { stdout, stderr } = await execAsync(command);
    console.log(`✅ ${description} - PASSED`);
    return {
      step: description,
      success: true,
      output: stdout,
      errors: stderr
    };
  } catch (error: any) {
    console.log(`❌ ${description} - FAILED`);
    return {
      step: description,
      success: false,
      output: error.stdout || '',
      errors: error.stderr || error.message
    };
  }
}

async function main() {
  console.log('🚀 M1SSION™ - Starting Comprehensive Quality Check...\n');
  
  const checks: QualityResult[] = [];
  
  // TypeScript Check
  checks.push(await runQualityCheck(
    'npx tsc --noEmit',
    'TypeScript Compilation Check'
  ));
  
  // ESLint Check
  checks.push(await runQualityCheck(
    'npx eslint "src/**/*.{ts,tsx}" --max-warnings=0',
    'ESLint Code Quality Check'
  ));
  
  // Build Test
  checks.push(await runQualityCheck(
    'npm run build',
    'Production Build Test'
  ));
  
  // Generate Report
  console.log('\n📊 QUALITY CHECK REPORT:');
  console.log('================================');
  
  let allPassed = true;
  
  for (const check of checks) {
    const status = check.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${check.step}: ${status}`);
    
    if (!check.success) {
      allPassed = false;
      console.log(`   Error: ${check.errors}`);
    }
  }
  
  console.log('================================');
  
  if (allPassed) {
    console.log('🎉 ALL QUALITY CHECKS PASSED - CODE IS READY FOR PRODUCTION');
    process.exit(0);
  } else {
    console.log('⚠️  QUALITY ISSUES DETECTED - REVIEW AND FIX BEFORE DEPLOYMENT');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runQualityCheck };