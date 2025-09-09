#!/usr/bin/env node
// Create Push Stable Tag
// © 2025 M1SSION™ - Joseph MULÉ

import { execSync } from 'child_process';

const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
const tagName = `push-stable-${timestamp}`;

console.log(`🏷️  Creating push stable tag: ${tagName}`);

try {
  // Create annotated tag
  execSync(`git tag -a ${tagName} -m "Push chain stable snapshot - ${new Date().toISOString()}"`, {
    stdio: 'inherit'
  });
  
  console.log(`✅ Tag created: ${tagName}`);
  console.log(`📝 To rollback to this state later:`);
  console.log(`   git checkout tags/${tagName}`);
  console.log(`   git checkout -b hotfix/rollback-push-${timestamp}`);
  
} catch (error) {
  console.error(`❌ Failed to create tag: ${error.message}`);
  process.exit(1);
}