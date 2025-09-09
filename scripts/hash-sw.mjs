#!/usr/bin/env node
// Service Worker Hash Calculator
// © 2025 M1SSION™ - Joseph MULÉ

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Calculating SW and protected files hashes...\n');

const protectedFiles = [
  'public/sw.js',
  'src/components/WebPushToggle.tsx',
  'src/utils/vapidHelper.ts',
  'src/utils/swControl.ts',
  'src/utils/safeWebPushSubscribe.ts',
  'src/main.tsx',
  'src/App.tsx',
  'index.html'
];

const hashes = {};
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);

// Get VAPID key (redacted)
let vapidKey = 'NOT_FOUND';
try {
  const envPath = join(projectRoot, '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    const vapidMatch = envContent.match(/VITE_VAPID_PUBLIC_KEY="?([^"\n]+)"?/);
    if (vapidMatch) {
      const key = vapidMatch[1];
      vapidKey = `${key.substring(0, 6)}...${key.substring(key.length - 6)}`;
    }
  }
} catch (error) {
  console.log(`⚠️  Could not read VAPID key: ${error.message}`);
}

// Calculate hashes
for (const file of protectedFiles) {
  const filePath = join(projectRoot, file);
  
  if (!existsSync(filePath)) {
    hashes[file] = 'FILE_NOT_FOUND';
    console.log(`⚠️  ${file} - NOT FOUND`);
    continue;
  }
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const hash = createHash('sha256').update(content).digest('hex');
    hashes[file] = hash;
    console.log(`✅ ${file} - ${hash.substring(0, 12)}...`);
  } catch (error) {
    hashes[file] = `ERROR: ${error.message}`;
    console.log(`❌ ${file} - ${error.message}`);
  }
}

// Generate snapshot document
const snapshotContent = `# Push Chain Snapshot

**Generated:** ${new Date().toISOString()}  
**Timestamp:** ${timestamp}

## Protected Files Hashes

${Object.entries(hashes).map(([file, hash]) => `- **${file}**: \`${hash}\``).join('\n')}

## VAPID Configuration

- **VITE_VAPID_PUBLIC_KEY**: \`${vapidKey}\` (redacted)

## Service Worker Details

${existsSync(join(projectRoot, 'public/sw.js')) ? `
- **Path**: /sw.js
- **Scope**: /
- **Features**: install, activate, push, skipWaiting, clients.claim
` : '- **Status**: SW file not found'}

## Rollback Instructions

To rollback to this snapshot:

1. \`\`\`bash
   git checkout tags/push-stable-${timestamp}
   \`\`\`

2. Verify hashes match this snapshot

3. Force deploy if needed:
   \`\`\`bash
   git push --force-with-lease origin hotfix/rollback-push
   \`\`\`

## Notes

- This snapshot represents a known-good state of the push notification chain
- All protected files are verified and hashed for integrity
- Any changes to protected files require \`override-push-guard\` label
`;

// Write snapshot file
const snapshotPath = join(projectRoot, 'docs/PUSH_CHAIN_SNAPSHOT.md');
writeFileSync(snapshotPath, snapshotContent);

console.log(`\n📄 Snapshot written to: docs/PUSH_CHAIN_SNAPSHOT.md`);
console.log(`🏷️  Tag suggestion: push-stable-${timestamp}`);