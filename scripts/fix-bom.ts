#!/usr/bin/env tsx
/**
 * Script to remove BOM (Byte Order Mark) characters from files
 */

import { glob } from "glob";
import fs from "node:fs";

const stripBom = (s:string) => s.charCodeAt(0)===0xFEFF ? s.slice(1) : s;

const run = async () => {
  const files = await glob("src/**/*.{ts,tsx}", { ignore: ['**/node_modules/**', '**/dist/**'] });
  let changed = 0;
  for (const f of files) {
    const c = fs.readFileSync(f, "utf8");
    const nc = stripBom(c);
    if (nc !== c) {
      fs.writeFileSync(f, nc);
      changed++;
    }
  }
  console.log(JSON.stringify({fixedBOM: changed}));
};
run();