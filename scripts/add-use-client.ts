#!/usr/bin/env tsx
/**
 * Script to add "use client" directive where needed
 */

import { glob } from "glob";
import fs from "node:fs";

const needsUseClient = (code: string) => {
  // Heuristics: JSX o hooks/DOM API → client
  const usesJSX = /<[A-Za-z][A-Za-z0-9]*/.test(code);
  const usesHooks = /\buse(State|Effect|Memo|Callback|Ref|Context|Reducer)\b/.test(code);
  const usesBrowser = /\b(window|document|localStorage|navigator)\b/.test(code);
  return usesJSX || usesHooks || usesBrowser;
};

const alreadyHasDirective = (code: string) => /^\s*["']use client["'];?/.test(code);

const shouldSkip = (filepath: string) => {
  // NON toccare push/FCM/OneSignal/SW chain
  const p = filepath.replace(/\\/g,"/");
  return (
    /^public\/sw/.test(p) ||
    /\/service-worker/i.test(p) ||
    /\/(Push|IOSPush|OneSignal)/.test(p) ||
    /\/lib\/push\//.test(p) ||
    /\/webpush/i.test(p) ||
    /\/subscribe\.ts$/.test(p)
  );
};

const addDirective = (code: string) => {
  const lines = code.split(/\r?\n/);
  // mantieni eventuali commenti licenza alla cima
  let i = 0;
  while (i < lines.length && /^\s*\/\//.test(lines[i])) i++;
  // inserisci direttiva subito dopo eventuali commenti iniziali
  lines.splice(i, 0, `"use client";`);
  return lines.join("\n");
};

const run = async () => {
  const files = await glob("src/**/*.{ts,tsx}", { ignore: ['**/node_modules/**', '**/dist/**'] });
  let added = 0, skipped = 0;
  for (const f of files) {
    if (shouldSkip(f)) { skipped++; continue; }
    const code = fs.readFileSync(f,"utf8");
    if (needsUseClient(code) && !alreadyHasDirective(code)) {
      fs.writeFileSync(f, addDirective(code));
      added++;
    }
  }
  console.log(JSON.stringify({useClientAdded: added, skipped}));
};
run();