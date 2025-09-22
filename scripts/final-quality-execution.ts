#!/usr/bin/env tsx
/**
 * M1SSION™ PWA - Final Quality Execution
 * Executes all quality checks and generates comprehensive report
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface ExecutionResult {
  step: string;
  success: boolean;
  output: string;
  errors: string;
  duration: number;
}

async function executeStep(command: string, description: string): Promise<ExecutionResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 Executing: ${description}...`);
    const { stdout, stderr } = await execAsync(command, { timeout: 120000 });
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${description} - COMPLETED (${duration}ms)`);
    return {
      step: description,
      success: true,
      output: stdout,
      errors: stderr,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${description} - FAILED (${duration}ms)`);
    
    return {
      step: description,
      success: false,
      output: error.stdout || '',
      errors: error.stderr || error.message,
      duration
    };
  }
}

async function checkCriticalFiles(): Promise<boolean> {
  const criticalFiles = [
    'src/main.tsx',
    'src/App.tsx',
    'public/sw.js',
    'index.html'
  ];
  
  let allPresent = true;
  
  for (const file of criticalFiles) {
    if (!existsSync(file)) {
      console.log(`❌ Missing critical file: ${file}`);
      allPresent = false;
    } else {
      console.log(`✅ Found: ${file}`);
    }
  }
  
  return allPresent;
}

async function main() {
  console.log('🚀 M1SSION™ - FINAL QUALITY EXECUTION');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  const results: ExecutionResult[] = [];
  
  // Step 1: Check critical files
  console.log('\n📁 CHECKING CRITICAL FILES:');
  const criticalFilesOk = await checkCriticalFiles();
  
  // Step 2: Fix imports, BOM, and use client
  console.log('\n🔧 APPLYING FIXES:');
  results.push(await executeStep('tsx scripts/fix-bom.ts', 'BOM Character Fix'));
  results.push(await executeStep('tsx scripts/fix-imports.ts', 'Import Statement Fix'));
  results.push(await executeStep('tsx scripts/add-use-client.ts', 'Use Client Directive Fix'));
  
  // Step 3: Clean console statements
  console.log('\n🧹 CLEANING CONSOLE STATEMENTS:');
  results.push(await executeStep('node scripts/clean-console-logs.js', 'Console Statement Cleanup'));
  
  // Step 4: Quality checks
  console.log('\n✅ RUNNING QUALITY CHECKS:');
  results.push(await executeStep('tsc --noEmit', 'TypeScript Compilation Check'));
  results.push(await executeStep('eslint "src/**/*.{ts,tsx}" --max-warnings=0', 'ESLint Code Quality Check'));
  
  // Step 5: Build test
  console.log('\n🏗️ PRODUCTION BUILD TEST:');
  results.push(await executeStep('npm run build', 'Production Build Test'));
  
  // Step 6: Generate final report
  console.log('\n📊 GENERATING FINAL REPORT:');
  results.push(await executeStep('tsx scripts/generate-quality-report.ts', 'Final Quality Report'));
  
  // Calculate overall results
  const totalDuration = Date.now() - startTime;
  const successfulSteps = results.filter(r => r.success).length;
  const failedSteps = results.filter(r => !r.success).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 FINAL EXECUTION SUMMARY:');
  console.log('='.repeat(60));
  
  for (const result of results) {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    const duration = `(${result.duration}ms)`;
    console.log(`${result.step}: ${status} ${duration}`);
    
    if (!result.success && result.errors) {
      console.log(`   Error: ${result.errors.substring(0, 200)}...`);
    }
  }
  
  console.log('\n📊 OVERALL STATISTICS:');
  console.log(`   Total execution time: ${totalDuration}ms`);
  console.log(`   Successful steps: ${successfulSteps}/${results.length}`);
  console.log(`   Failed steps: ${failedSteps}/${results.length}`);
  console.log(`   Critical files: ${criticalFilesOk ? 'ALL PRESENT' : 'MISSING FILES'}`);
  
  const overallSuccess = failedSteps === 0 && criticalFilesOk;
  
  if (overallSuccess) {
    console.log('\n🎉 FINAL QUALITY EXECUTION: COMPLETED SUCCESSFULLY');
    console.log('   M1SSION™ PWA is production-ready!');
    process.exit(0);
  } else {
    console.log('\n⚠️  FINAL QUALITY EXECUTION: COMPLETED WITH ISSUES');
    console.log('   Review failed steps and fix issues before deployment');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as executeFinalQuality };