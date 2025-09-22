#!/usr/bin/env tsx
/**
 * M1SSION™ PWA - Complete Quality Assurance Suite
 * Runs all fixes and quality checks in correct order
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface StepResult {
  name: string;
  success: boolean;
  output: string;
  duration: number;
}

async function runStep(command: string, description: string): Promise<StepResult> {
  const startTime = Date.now();
  try {
    console.log(`🔧 ${description}...`);
    const { stdout, stderr } = await execAsync(command, { 
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    const duration = Date.now() - startTime;
    console.log(`✅ ${description} completed in ${duration}ms`);
    return {
      name: description,
      success: true,
      output: stdout + (stderr ? `\nSTDERR: ${stderr}` : ''),
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${description} failed after ${duration}ms`);
    return {
      name: description,
      success: false,
      output: error.stdout + '\n' + error.stderr,
      duration
    };
  }
}

async function main() {
  console.log('🚀 M1SSION™ - Complete Quality Assurance Suite Starting...\n');
  
  const results: StepResult[] = [];
  const totalStartTime = Date.now();
  
  // Step 1: Remove BOM characters
  results.push(await runStep(
    'tsx scripts/fix-bom.ts',
    'Remove BOM Characters'
  ));
  
  // Step 2: Fix import statements
  results.push(await runStep(
    'tsx scripts/fix-imports.ts',
    'Fix Import Statements'
  ));
  
  // Step 3: Add use client directives
  results.push(await runStep(
    'tsx scripts/add-use-client.ts',
    'Add Use Client Directives'
  ));
  
  // Step 4: TypeScript compilation check
  results.push(await runStep(
    'npx tsc --noEmit',
    'TypeScript Compilation Check'
  ));
  
  // Step 5: ESLint check
  results.push(await runStep(
    'npx eslint "src/**/*.{ts,tsx}" --max-warnings=0',
    'ESLint Code Quality Check'
  ));
  
  // Step 6: Production build test
  results.push(await runStep(
    'npm run build',
    'Production Build Test'
  ));
  
  // Step 7: Verify critical files exist
  const criticalFiles = [
    'dist/index.html',
    'dist/sw.js',
    'dist/_headers',
    'dist/_redirects'
  ];
  
  let filesExist = true;
  for (const file of criticalFiles) {
    if (!existsSync(file)) {
      console.log(`❌ Critical file missing: ${file}`);
      filesExist = false;
    }
  }
  
  if (filesExist) {
    results.push({
      name: 'Critical Files Verification',
      success: true,
      output: 'All critical files present',
      duration: 0
    });
  } else {
    results.push({
      name: 'Critical Files Verification',
      success: false,
      output: 'Missing critical files',
      duration: 0
    });
  }
  
  const totalDuration = Date.now() - totalStartTime;
  
  // Generate comprehensive report
  console.log('\n📊 COMPREHENSIVE QUALITY REPORT');
  console.log('='.repeat(50));
  console.log(`Total execution time: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);
  console.log('='.repeat(50));
  
  let allPassed = true;
  let passedCount = 0;
  
  for (const result of results) {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    const duration = result.duration > 0 ? ` (${result.duration}ms)` : '';
    console.log(`${result.name}: ${status}${duration}`);
    
    if (result.success) {
      passedCount++;
    } else {
      allPassed = false;
      console.log(`   Output: ${result.output.substring(0, 200)}...`);
    }
  }
  
  console.log('='.repeat(50));
  console.log(`Summary: ${passedCount}/${results.length} checks passed`);
  
  if (allPassed) {
    console.log('🎉 ALL QUALITY CHECKS PASSED');
    console.log('💚 CODE IS PRODUCTION-READY');
    console.log('🚀 READY FOR DEPLOYMENT');
    process.exit(0);
  } else {
    console.log('⚠️  QUALITY ISSUES DETECTED');
    console.log('🔧 REVIEW AND FIX ISSUES BEFORE DEPLOYMENT');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runQualitySuite };