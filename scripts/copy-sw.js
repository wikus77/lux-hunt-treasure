#!/usr/bin/env node
// © 2025 M1SSION™ - Copy custom SW to dist (bypass Workbox)
const fs = require('fs');
const path = require('path');

const srcSW = path.join(__dirname, '../public/sw.js');
const distSW = path.join(__dirname, '../dist/sw.js');

try {
  // Ensure dist directory exists
  const distDir = path.dirname(distSW);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy custom SW (overwrite any Workbox-generated SW)
  fs.copyFileSync(srcSW, distSW);
  console.log('✅ Custom SW copied to dist/sw.js (bypassing Workbox)');
  
  // Verify the copy contains our signature
  const content = fs.readFileSync(distSW, 'utf8');
  if (content.includes('importScripts(\'sw-push.js\')') && content.includes('NetworkFirst')) {
    console.log('✅ Custom SW verified - contains push chain and NetworkFirst');
  } else {
    console.error('❌ Custom SW verification failed');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to copy custom SW:', error);
  process.exit(1);
}