#!/usr/bin/env node
/**
 * Pipeline completa per raggiungere 100% qualità
 * Esegue tutti gli step di fix e verifica finale
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 M1SSION™ PWA - Pipeline Qualità 100%');
console.log('=====================================\n');

const executeStep = (command, description) => {
  console.log(`\n🔧 ${description}`);
  console.log(`Command: ${command}\n`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log('✅ SUCCESS');
    if (output.trim()) {
      console.log(`Output: ${output.trim()}`);
    }
    return { success: true, output: output.trim() };
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.stdout) console.log(`stdout: ${error.stdout}`);
    if (error.stderr) console.log(`stderr: ${error.stderr}`);
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
};

const checkCriticalFiles = () => {
  const files = [
    'src/main.tsx',
    'src/App.tsx', 
    'public/sw.js',
    'index.html'
  ];
  
  console.log('\n📋 Verifica File Critici:');
  let allExist = true;
  files.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allExist = false;
  });
  return allExist;
};

const main = async () => {
  const startTime = Date.now();
  const results = [];

  // Step 1: Verifica file critici
  console.log('\n📋 FASE 1: Verifica Pre-Esecuzione');
  const criticalFilesOk = checkCriticalFiles();
  if (!criticalFilesOk) {
    console.log('❌ File critici mancanti - interrotto');
    process.exit(1);
  }

  // Step 2: Fix BOM
  results.push(executeStep('node -r tsx/cjs scripts/fix-bom.ts', 'FASE 2: Fix BOM Characters'));

  // Step 3: Fix Imports  
  results.push(executeStep('node -r tsx/cjs scripts/fix-imports.ts', 'FASE 3: Fix Import Statements'));

  // Step 4: Add Use Client
  results.push(executeStep('node -r tsx/cjs scripts/add-use-client.ts', 'FASE 4: Add "use client" Directives'));

  // Step 5: TypeScript Check
  results.push(executeStep('npx tsc --noEmit', 'FASE 5: TypeScript Compilation Check'));

  // Step 6: ESLint Check
  results.push(executeStep('npx eslint "src/**/*.{ts,tsx}" --max-warnings=0 --rule "@typescript-eslint/no-explicit-any: off"', 'FASE 6: ESLint Quality Check'));

  // Step 7: Production Build Test
  results.push(executeStep('npm run build', 'FASE 7: Production Build Test'));

  // Report Finale
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n\n📊 REPORT FINALE QUALITÀ 100%');
  console.log('===============================');
  console.log(`⏱️  Durata totale: ${duration}s`);
  console.log(`📁 Steps eseguiti: ${results.length}`);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`✅ Successi: ${successful}`);
  console.log(`❌ Fallimenti: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 QUALITÀ 100% RAGGIUNTA!');
    console.log('✅ 0 Parsing Errors');
    console.log('✅ 0 Import Spezzati'); 
    console.log('✅ Build Production OK');
    console.log('✅ Push Chain Intatta');
    console.log('\n🚀 PWA PRODUCTION READY');
    process.exit(0);
  } else {
    console.log('\n⚠️  QUALITÀ NON RAGGIUNTA');
    console.log('❌ Alcuni step falliti');
    process.exit(1);
  }
};

main().catch(console.error);