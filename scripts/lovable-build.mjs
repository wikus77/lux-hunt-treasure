// scripts/lovable-build.mjs
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
const LOG_DIR = ".lovable-logs";
mkdirSync(LOG_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFile = join(LOG_DIR, `lovable-build-${stamp}.log`);

// === PRE-INSTALL DIAGNOSTICS ===
function dumpEnvironment() {
  // Dump VITE_* env variable names only (no values for security)
  const viteEnvNames = Object.keys(process.env)
    .filter(k => k.startsWith('VITE_'))
    .sort();
  writeFileSync(
    join(LOG_DIR, `publish-env-${stamp}.txt`),
    `=== VITE_* Environment Variables (names only) ===\n` +
    `Total: ${viteEnvNames.length}\n\n` +
    viteEnvNames.join('\n') + '\n'
  );
  console.log(`✓ Dumped ${viteEnvNames.length} VITE_* env names to publish-env-${stamp}.txt`);
}

function dumpRunnerInfo() {
  const runnerInfo = [
    `=== Runner Info ===`,
    `Node: ${process.version}`,
    `Platform: ${process.platform}`,
    `Architecture: ${process.arch}`,
    `Start: ${new Date().toISOString()}`,
    `Working Directory: ${process.cwd()}`,
  ].join('\n');
  writeFileSync(
    join(LOG_DIR, `runner-info-${stamp}.txt`),
    runnerInfo + '\n'
  );
  console.log(`✓ Runner diagnostics saved to runner-info-${stamp}.txt`);
}

function extractLogFragments() {
  try {
    const fullLog = readFileSync(logFile, 'utf8');
    const lines = fullLog.split('\n');
    
    // First 80 lines
    writeFileSync(
      join(LOG_DIR, `first-80-${stamp}.log`),
      lines.slice(0, 80).join('\n')
    );
    
    // First error line
    const errorPattern = /ERROR|ERR!|TS[0-9]{4}|RollupError|Cannot find module|TypeError|ReferenceError|Build failed|Failed to|ENOENT|ELIFECYCLE/i;
    const errorLine = lines.find(line => errorPattern.test(line));
    if (errorLine) {
      writeFileSync(
        join(LOG_DIR, `error-line-${stamp}.txt`),
        `=== First Error Line ===\n${errorLine}\n`
      );
      console.log(`✓ Error line captured: ${errorLine.substring(0, 80)}...`);
    }
    
    // Last 120 lines
    writeFileSync(
      join(LOG_DIR, `last-120-${stamp}.log`),
      lines.slice(-120).join('\n')
    );
    
    console.log(`✓ Log fragments extracted (first-80, error-line, last-120)`);
  } catch (e) {
    console.warn(`⚠ Failed to extract log fragments: ${e.message}`);
  }
}
function run(cmd) {
  console.log(`$ ${cmd}`);
  try {
    const out = execSync(cmd, { stdio: "pipe", encoding: "utf8" });
    process.stdout.write(out); writeFileSync(logFile, out, { flag: "a" }); return 0;
  } catch (e) {
    const out = e?.stdout?.toString?.() || ""; const err = e?.stderr?.toString?.() || "";
    process.stdout.write(out); process.stderr.write(err);
    writeFileSync(logFile, out + err, { flag: "a" }); return e?.status ?? 1;
  }
}
console.log("=== LOVABLE BUILD START ===");
console.log("\n=== PRE-INSTALL DIAGNOSTICS ===");
dumpEnvironment();
dumpRunnerInfo();
console.log("\n=== TOOLCHAIN DETECTION ===");
run("node -v"); run("npm -v || true"); run("pnpm -v || true"); run("which node || true"); run("which pnpm || true");
console.log("\n=== PREPARE PNPM ===");
run("corepack enable"); run("corepack prepare pnpm@9.12.3 --activate"); run("pnpm -v");
console.log("\n=== INSTALL (LOCKED) ===");
let code = run("pnpm install --frozen-lockfile"); if (code) process.exit(code);
console.log("\n=== PREBUILD (GUARD) ===");
code = run("pnpm run -s prebuild"); if (code) process.exit(code);
console.log("\n=== BUILD (VITE) ===");
code = run("pnpm run -s build");
if (code) {
  console.error("❌ BUILD FAILED — log:", logFile);
  extractLogFragments();
  run(`grep -E -m1 "(ERROR|ERR!|TS[0-9]{4}|RollupError|Cannot find module|TypeError|ReferenceError|Build failed|Failed to)" "${logFile}" || true`);
  // stampa anche le ultime 200 righe per contesto
  run(`tail -n 200 "${logFile}" || true`);
  process.exit(code);
}
console.log("\n=== DIST CHECK ===");
code = run("ls -la dist | sed -n '1,120p'"); if (code) process.exit(code);
console.log("\n=== POST-BUILD DIAGNOSTICS ===");
extractLogFragments();
console.log("✅ BUILD OK — log:", logFile); process.exit(0);

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
