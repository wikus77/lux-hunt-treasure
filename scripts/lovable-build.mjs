// scripts/lovable-build.mjs
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const LOG_DIR = ".lovable-logs";
mkdirSync(LOG_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFile = join(LOG_DIR, `lovable-build-${stamp}.log`);
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
  run(`grep -E -m1 "(ERROR|ERR!|TS[0-9]{4}|RollupError|Cannot find module|TypeError|ReferenceError|Build failed|Failed to)" "${logFile}" || true`);
  // stampa anche le ultime 200 righe per contesto
  run(`tail -n 200 "${logFile}" || true`);
  process.exit(code);
}
console.log("\n=== DIST CHECK ===");
code = run("ls -la dist | sed -n '1,120p'"); if (code) process.exit(code);
console.log("✅ BUILD OK — log:", logFile); process.exit(0);
