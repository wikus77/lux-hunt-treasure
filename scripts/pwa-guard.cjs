// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// PWA Guard - Prevents Workbox/registerSW regressions
const { readFileSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');

const dist = join(process.cwd(), 'dist');

if (!existsSync(dist)) {
  console.log('⚠️ PWA guard: dist/ not found, skipping check');
  process.exit(0);
}

const badPatterns = [
  /workbox/i,
  /precacheAndRoute/i,
  /registerSW\.js/i,
  /importScripts.*workbox/i,
  /vite-plugin-pwa/i
];

function scanDirectory(dirPath) {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (/\.(js|html|ts|tsx)$/.test(entry.name)) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          
          for (const pattern of badPatterns) {
            if (pattern.test(content)) {
              console.error(`❌ PWA guard: ${fullPath} contains forbidden pattern: ${pattern}`);
              console.error('This indicates a Workbox/VitePWA regression');
              process.exit(1);
            }
          }
        } catch (readError) {
          console.warn(`⚠️ PWA guard: Could not read ${fullPath}, skipping`);
        }
      }
    }
  } catch (dirError) {
    console.warn(`⚠️ PWA guard: Could not scan ${dirPath}, skipping`);
  }
}

console.log('🔍 PWA guard: Scanning for Workbox/registerSW regressions...');
scanDirectory(dist);
console.log('✅ PWA guard: No forbidden patterns found - build is clean');