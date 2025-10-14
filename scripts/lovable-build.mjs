// scripts/lovable-build.mjs
// Runner di build "parlante" per Lovable: forza PNPM, esegue install+prebuild+build
// e stampa log completi + estratto primo errore. Nessuna modifica a Guard/SW/VAPID.
// © M1SSION™ / NIYVORA KFT™

import { spawn } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { EOL } from "node:os";
import path from "node:path";

const LOG_DIR = ".lovable-logs";
const LOG_FILE = path.join(LOG_DIR, `build-${Date.now()}.log`);

if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
const out = createWriteStream(LOG_FILE, { flags: "a" });

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], shell: false, ...opts });
    let buf = "";
    const tap = (d) => {
      const s = d.toString();
      buf += s;
      process.stdout.write(s);
      out.write(s);
    };
    p.stdout.on("data", tap);
    p.stderr.on("data", tap);
    p.on("close", (code) => resolve({ code, text: buf }));
  });
}

(async () => {
  console.log("=== M1SSION™ Lovable Build Runner ===");
  console.log("Node:", process.version);

  // 1) Abilita PNPM via corepack
  let r = await run("node", ["-e", "require('child_process').execSync('corepack enable', {stdio:'inherit'})"]);
  // 2) Prepara versione PNPM (tenere in sync con repo)
  r = await run("node", ["-e", "require('child_process').execSync('corepack prepare pnpm@9.12.3 --activate', {stdio:'inherit'})"]);
  r = await run("pnpm", ["-v"]);
  if (r.code !== 0) {
    console.error("❌ PNPM non disponibile. Interrompo.");
    process.exit(1);
  }

  // 3) Install con lock pnpm
  console.log(EOL + "=== INSTALL (pnpm --frozen-lockfile) ===");
  r = await run("pnpm", ["install", "--frozen-lockfile"]);
  const installFailed = r.code !== 0;

  // 4) Prebuild (Guard)
  console.log(EOL + "=== PREBUILD (Guard) ===");
  const pre = await run("pnpm", ["run", "-s", "prebuild"]);
  const preFailed = pre.code !== 0;

  // 5) Build Vite
  console.log(EOL + "=== BUILD (vite build) ===");
  const build = await run("pnpm", ["run", "-s", "build"]);
  const buildFailed = build.code !== 0;

  // Report sintetico + estratti utili
  const all = (txt) => txt.split(/\r?\n/);
  const firstErrLine =
    [...all(r.text), ...all(pre.text), ...all(build.text)].find((l) =>
      /(ERROR|ERR!|TS\d{4}|RollupError|Build failed|Failed to|Cannot find module|TypeError|ReferenceError)/i.test(l)
    ) || "—";

  console.log(EOL + "=== SUMMARY ===");
  console.log("Install exit:", installFailed ? 1 : 0);
  console.log("Prebuild exit:", preFailed ? 1 : 0);
  console.log("Build exit:", buildFailed ? 1 : 0);
  console.log("FirstError:", firstErrLine);
  console.log(`Full log saved at: ${LOG_FILE}`);

  // Tail ultimi 200 righe per debug
  const tail = [...all(build.text)].slice(-200).join("\n");
  console.log(EOL + "=== BUILD TAIL (last 200 lines) ===");
  console.log(tail || "(no tail)");

  // Esito finale: se build ok, assicurati che dist/ esista
  if (!buildFailed) {
    console.log(EOL + "=== DIST CHECK ===");
    const ls = await run(process.platform === "win32" ? "cmd" : "bash", [process.platform === "win32" ? "/c" : "-lc", "ls -la dist || echo 'dist missing'"]);
    if (ls.code === 0) {
      console.log("✅ BUILD OK — Guard passato — dist/ presente");
      process.exit(0);
    }
  }

  console.error(EOL + "❌ BUILD FAILED — vedi log sopra e file:", LOG_FILE);
  process.exit(1);
})();
