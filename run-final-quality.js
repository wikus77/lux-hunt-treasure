#!/usr/bin/env node
/**
 * M1SSION™ PWA - Esecutore Finale Qualità
 * Esegue tutti gli script di qualità in sequenza e genera report finale
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 M1SSION™ - ESECUZIONE FINALE QUALITÀ INIZIATA');
console.log('='.repeat(70));

let results = [];

const executeStep = (command, description) => {
  console.log(`\n🔄 ${description}...`);
  const start = Date.now();
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    const duration = Date.now() - start;
    console.log(`✅ ${description} - COMPLETATO (${duration}ms)`);
    
    results.push({
      step: description,
      success: true,
      duration,
      command,
      output: output.substring(0, 500) // Primi 500 caratteri
    });
    
    return { success: true, output };
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ ${description} - FALLITO (${duration}ms)`);
    console.log(`   Errore: ${error.message.substring(0, 200)}`);
    
    results.push({
      step: description,
      success: false,
      duration,
      command,
      error: error.message,
      output: error.stdout || ''
    });
    
    return { success: false, error };
  }
};

// 1. Pulizia console statements
console.log('\n📋 FASE 1: PULIZIA CONSOLE STATEMENTS');
const cleanResult = executeStep('node scripts/clean-console-logs.js', 'Pulizia Console Statements');

// 2. Controllo TypeScript
console.log('\n📋 FASE 2: CONTROLLI TYPESCRIPT');
const tscResult = executeStep('npx tsc --noEmit', 'Controllo TypeScript');

// 3. Build di produzione
console.log('\n📋 FASE 3: BUILD PRODUZIONE');
const buildResult = executeStep('npm run build', 'Build Produzione');

// 4. Verifica file critici
console.log('\n📋 FASE 4: VERIFICA FILE CRITICI');
const criticalFiles = [
  'dist/index.html',
  'dist/sw.js',
  'public/sw.js',
  'src/main.tsx'
];

let criticalCheck = true;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - PRESENTE`);
  } else {
    console.log(`❌ ${file} - MANCANTE`);
    criticalCheck = false;
  }
});

results.push({
  step: 'Verifica File Critici',
  success: criticalCheck,
  duration: 0,
  command: 'fs.existsSync check'
});

// 5. Conteggio console statements post-pulizia
console.log('\n📋 FASE 5: ANALISI POST-PULIZIA');
let remainingConsoles = 0;
try {
  const { execSync } = require('child_process');
  const grepResult = execSync('find src -name "*.tsx" -o -name "*.ts" | xargs grep -c "console\\." || true', { encoding: 'utf8' });
  const lines = grepResult.split('\n').filter(line => line.trim());
  remainingConsoles = lines.reduce((sum, line) => {
    const match = line.match(/:(\d+)$/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
} catch (e) {
  console.log('⚠️ Impossibile contare console statements');
}

console.log(`📊 Console statements rimanenti: ${remainingConsoles}`);

// REPORT FINALE
console.log('\n' + '='.repeat(70));
console.log('📋 M1SSION™ - REPORT FINALE QUALITÀ');
console.log('='.repeat(70));

const successCount = results.filter(r => r.success).length;
const totalSteps = results.length;
const successRate = Math.round((successCount / totalSteps) * 100);

console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
console.log(`📊 Tasso Successo: ${successCount}/${totalSteps} (${successRate}%)`);
console.log(`🧹 Console Statements Rimasti: ${remainingConsoles}`);
console.log('');

results.forEach(result => {
  const status = result.success ? '✅ PASSED' : '❌ FAILED';
  const duration = result.duration ? ` (${result.duration}ms)` : '';
  console.log(`${result.step}: ${status}${duration}`);
  
  if (!result.success && result.error) {
    console.log(`   Errore: ${result.error.substring(0, 200)}...`);
  }
});

console.log('\n📋 STATO FINALE:');
if (successCount === totalSteps) {
  console.log('🎉 M1SSION™ PWA - PRODUCTION READY');
  console.log('   Tutti i controlli di qualità sono passati con successo');
  console.log(`   ✅ Console statements ottimizzati: ${remainingConsoles} rimanenti`);
} else {
  console.log('⚠️  M1SSION™ PWA - RICHIEDE ATTENZIONE');
  console.log(`   ${totalSteps - successCount} controllo/i fallito/i`);
}

console.log('\n🔐 REPORT FIRMATO: JOSEPH MULÈ — CEO di NIYVORA KFT™');
console.log('='.repeat(70));

// Exit con codice appropriato
process.exit(successCount === totalSteps ? 0 : 1);