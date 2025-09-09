#!/usr/bin/env node
// Push Chain Guard Tests
// © 2025 M1SSION™ - Joseph MULÉ

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔒 Running Push Chain Guard Tests...\n');

let failures = 0;

// Test 1: VAPID key presence
function testVapidKey() {
  console.log('📋 Testing VAPID key configuration...');
  
  try {
    const envPath = join(projectRoot, '.env');
    if (!existsSync(envPath)) {
      console.log('❌ .env file not found');
      return false;
    }
    
    const envContent = readFileSync(envPath, 'utf8');
    const vapidMatch = envContent.match(/VITE_VAPID_PUBLIC_KEY="?([^"\n]+)"?/);
    
    if (!vapidMatch) {
      console.log('❌ VITE_VAPID_PUBLIC_KEY not found in .env');
      return false;
    }
    
    const vapidKey = vapidMatch[1];
    if (vapidKey.length < 80) {
      console.log('❌ VAPID key appears too short');
      return false;
    }
    
    console.log(`✅ VAPID key found (${vapidKey.substring(0, 6)}...${vapidKey.substring(-6)})`);
    return true;
  } catch (error) {
    console.log(`❌ Error reading VAPID key: ${error.message}`);
    return false;
  }
}

// Test 2: Single SW registration
function testSingleSWRegistration() {
  console.log('\n📋 Testing single SW registration...');
  
  const filesToCheck = [
    'src/main.tsx',
    'src/App.tsx',
    'index.html'
  ];
  
  let swRegistrations = 0;
  let firebaseRefs = 0;
  
  for (const file of filesToCheck) {
    const filePath = join(projectRoot, file);
    if (!existsSync(filePath)) continue;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      
      // Count SW registrations
      const swMatches = content.match(/navigator\.serviceWorker\.register\(/g);
      if (swMatches) {
        swRegistrations += swMatches.length;
        console.log(`   Found ${swMatches.length} SW registration(s) in ${file}`);
      }
      
      // Check for firebase-messaging-sw references
      if (content.includes('firebase-messaging-sw')) {
        firebaseRefs++;
        console.log(`   ⚠️  Found firebase-messaging-sw reference in ${file}`);
      }
    } catch (error) {
      console.log(`   ❌ Error reading ${file}: ${error.message}`);
    }
  }
  
  const success = swRegistrations === 1 && firebaseRefs === 0;
  
  if (success) {
    console.log('✅ Exactly one SW registration found, no Firebase SW references');
  } else {
    console.log(`❌ Expected 1 SW registration, found ${swRegistrations}. Firebase refs: ${firebaseRefs}`);
  }
  
  return success;
}

// Test 3: SW file integrity
function testSWIntegrity() {
  console.log('\n📋 Testing SW file integrity...');
  
  const swPath = join(projectRoot, 'public/sw.js');
  if (!existsSync(swPath)) {
    console.log('❌ /sw.js not found');
    return false;
  }
  
  try {
    const content = readFileSync(swPath, 'utf8');
    const hash = createHash('sha256').update(content).digest('hex');
    
    // Check for critical SW features
    const hasInstall = content.includes("addEventListener('install'");
    const hasActivate = content.includes("addEventListener('activate'");
    const hasPush = content.includes("addEventListener('push'");
    const hasSkipWaiting = content.includes('skipWaiting()');
    const hasClaim = content.includes('clients.claim()');
    
    if (hasInstall && hasActivate && hasPush && hasSkipWaiting && hasClaim) {
      console.log(`✅ SW file integrity verified (${hash.substring(0, 12)}...)`);
      return true;
    } else {
      console.log('❌ SW file missing critical features');
      console.log(`   Install: ${hasInstall}, Activate: ${hasActivate}, Push: ${hasPush}`);
      console.log(`   SkipWaiting: ${hasSkipWaiting}, Claim: ${hasClaim}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error reading SW file: ${error.message}`);
    return false;
  }
}

// Test 4: No firebase-messaging-sw.js
function testNoFirebaseSW() {
  console.log('\n📋 Testing Firebase SW absence...');
  
  const firebaseSWPath = join(projectRoot, 'public/firebase-messaging-sw.js');
  
  if (!existsSync(firebaseSWPath)) {
    console.log('✅ No firebase-messaging-sw.js found (correct)');
    return true;
  }
  
  try {
    const content = readFileSync(firebaseSWPath, 'utf8').trim();
    if (content === '') {
      console.log('✅ firebase-messaging-sw.js is empty (acceptable)');
      return true;
    } else {
      console.log('❌ firebase-messaging-sw.js exists and has content');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error checking firebase-messaging-sw.js: ${error.message}`);
    return false;
  }
}

// Run all tests
const tests = [
  testVapidKey,
  testSingleSWRegistration,
  testSWIntegrity,
  testNoFirebaseSW
];

for (const test of tests) {
  if (!test()) {
    failures++;
  }
}

console.log(`\n🔒 Push Guard Tests Complete: ${tests.length - failures}/${tests.length} passed`);

if (failures > 0) {
  console.log('\n❌ Some tests failed. Push chain protection violations detected.');
  process.exit(1);
} else {
  console.log('\n✅ All push guard tests passed. Chain integrity verified.');
  process.exit(0);
}