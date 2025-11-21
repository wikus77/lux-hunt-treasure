#!/usr/bin/env node
/**
 * Enhanced Lovable Publish Runner — diagnostics only
 * - Dumps VITE_* names (no values)
 * - Logs Node/pnpm versions
 * - Creates first-80 / error-line / last-120 slices
 * - Optional .env.lovable bootstrap for public VITE_* keys only
 * SAFETY: does not touch app logic, Buzz/Map, geo, push, Norah, Stripe, markers, Cron, DB.
 * // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const LOG_DIR = join(ROOT, '.lovable-logs');
mkdirSync(LOG_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g,'-');
const fullLog = join(LOG_DIR, `lovable-build-${stamp}.log`);

function log(line) {
  const s = `[${new Date().toISOString()}] ${line}\n`;
  appendFileSync(fullLog, s);
  process.stdout.write(line + '\n');
}
function run(cmd, args = [], opts = {}) {
  log(`$ ${[cmd, ...args].join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: ['ignore','pipe','pipe'], shell: false, env: process.env, ...opts });
  const out = (res.stdout?.toString()||'') + (res.stderr?.toString()||'');
  appendFileSync(fullLog, out);
  process.stdout.write(res.stdout || '');
  process.stderr.write(res.stderr || '');
  if (res.status !== 0) {
    log(`EXIT ${res.status}`);
    postprocess();
    process.exit(res.status || 1);
  }
  return out;
}

// --- Pre: dump VITE_* names (before bootstrap)
const viteNamesBefore = Object.keys(process.env).filter(k=>k.startsWith('VITE_')).sort();
writeFileSync(join(LOG_DIR, `publish-env-${stamp}.txt`), viteNamesBefore.join('\n') + '\n');

// Runner info (pre)
writeFileSync(
  join(LOG_DIR, `runner-info-${stamp}.txt`),
  `Node: ${process.version}\nPlatform: ${process.platform}-${process.arch}\nStart: ${new Date().toISOString()}\n`
);

// --- Optional repo-scoped env bootstrap (public VITE_* ONLY)
try {
  const envFile = join(ROOT, '.env.lovable');
  if (existsSync(envFile)) {
    const lines = readFileSync(envFile, 'utf8').split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      const [, key, rawVal] = m;
      if (!key.startsWith('VITE_')) continue;
      if (!process.env[key] || process.env[key] === '') {
        let val = (rawVal ?? '').trim();
        if (key === 'VITE_VAPID_PUBLIC_KEY' && (!val || val === '__AUTO__')) {
          const p = join(ROOT, 'public', 'vapid-public.txt');
          if (existsSync(p)) {
            val = (readFileSync(p, 'utf8').split(/\r?\n/).find(l => l.trim()) || '').trim();
          }
        }
        process.env[key] = val;
      }
    }
  }
} catch { /* no-op */ }

// Dump VITE_* names again (after bootstrap)
const viteNamesAfter = Object.keys(process.env).filter(k=>k.startsWith('VITE_')).sort();
writeFileSync(join(LOG_DIR, `publish-env-after-${stamp}.txt`), viteNamesAfter.join('\n') + '\n');

// Corepack + pnpm
run('bash', ['-lc', 'corepack enable || true']);
run('bash', ['-lc', 'corepack prepare pnpm@9.12.3 --activate || true']);
const pnpmv = run('bash', ['-lc', 'pnpm -v || true']).trim();
appendFileSync(join(LOG_DIR, `runner-info-${stamp}.txt`), `pnpm: ${pnpmv}\n`);

// Install & build (unchanged sequence)
run('bash', ['-lc', 'pnpm install --frozen-lockfile --use-lockfile=true']);
run('bash', ['-lc', 'pnpm run -s prebuild']);
run('bash', ['-lc', 'pnpm run -s build']);

// Post slices
function postprocess() {
  try {
    const txt = readFileSync(fullLog, 'utf8');
    const lines = txt.split('\n');
    writeFileSync(join(LOG_DIR, `first-80-${stamp}.log`), lines.slice(0, 80).join('\n'));
    const errLine = lines.find(l => /ERROR|ERR!|TS[0-9]{4}|RollupError|Cannot find module|TypeError|ReferenceError|Build failed|Failed to|ENOENT|ELIFECYCLE/i.test(l));
    if (errLine) writeFileSync(join(LOG_DIR, `error-line-${stamp}.txt`), errLine + '\n');
    writeFileSync(join(LOG_DIR, `last-120-${stamp}.log`), lines.slice(-120).join('\n'));
    appendFileSync(join(LOG_DIR, `runner-info-${stamp}.txt`), `End: ${new Date().toISOString()}\n`);
  } catch { /* ignore */ }
}
postprocess();
