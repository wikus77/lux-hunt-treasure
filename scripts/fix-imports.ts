#!/usr/bin/env tsx
/**
 * Script to fix broken import statements
 */

import { glob } from "glob";
import fs from "node:fs";

const RE_BLOCK = /(^|\n)([ \t]*)([A-Za-z0-9_,$ \t\n\r]+)\n[ \t]*\}[ \t]*from[ \t]*(['"][^'"]+['"])[ \t]*;?/g;

const fixContent = (code: string) => {
  return code.replace(RE_BLOCK, (m, nl, indent, names, from) => {
    // se già c'è "import", non toccare
    if (/^\s*import\s/.test(names)) return m;
    // normalizza elenco simboli su una riga
    const compact = names.replace(/\s+/g, " ").trim().replace(/,\s*$/,"");
    // se sembra default + named (rara), NON assumere: qui gestiamo solo named
    // ricomponi come import { ... } from 'mod'
    return `${nl}${indent}import { ${compact} } from ${from};`;
  });
};

const run = async () => {
  const files = await glob("src/**/*.{ts,tsx}", { ignore: ['**/node_modules/**', '**/dist/**'] });
  let touched = 0;
  for (const f of files) {
    const before = fs.readFileSync(f,"utf8");
    const after = fixContent(before);
    if (after !== before) {
      fs.writeFileSync(f, after);
      touched++;
    }
  }
  console.log(JSON.stringify({fixedImports: touched}));
};
run();