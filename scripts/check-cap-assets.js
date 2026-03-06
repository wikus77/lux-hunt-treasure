#!/usr/bin/env node
/**
 * Check that dist contains all GLB paths required by agentCatalog (and thus by cap sync).
 * public/models/*.glb are in .gitignore — if missing, build won't copy them and cap sync fails.
 * Run after: npm run build
 * Run before: npx cap sync (or use npm run cap:sync:ios which runs build → check → sync).
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');

// Extract glbPath from agentCatalog.ts (avoid importing TS; simple regex)
const catalogPath = join(root, 'src/components/agent/agentCatalog.ts');
const catalog = readFileSync(catalogPath, 'utf8');
const glbPaths = [...catalog.matchAll(/glbPath:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);

const missing = [];
for (const p of glbPaths) {
  const relative = p.startsWith('/') ? p.slice(1) : p;
  const full = join(distDir, relative);
  if (!existsSync(full)) missing.push(relative);
}

if (missing.length > 0) {
  console.error('\n❌ [check-cap-assets] Missing in dist/ (required for cap sync):');
  missing.forEach((f) => console.error('   -', f));
  console.error('\n   These come from public/. The folder public/models/*.glb is in .gitignore.');
  console.error('   Ensure public/models/ has all .glb assets (copy from backup or teammate), then run:');
  console.error('   npm run build && npx cap sync ios\n');
  process.exit(1);
}

console.log('✅ [check-cap-assets] All', glbPaths.length, 'GLB paths present in dist/');
