const fs = require('fs');
const path = require('path');

const SRC_DIR = 'src';
const REF = 'vkjrqirvdvjbemsfzxof';
const urlRe = new RegExp(String.raw`https://[a-z0-9-]+\.supabase\.co`, 'g');
const fnUrlRe = new RegExp(String.raw`https://[a-z0-9-]+\.functions\.supabase\.co`, 'g');
const tokenKeyRe = new RegExp(String.raw`sb-` + REF + String.raw`-auth-token`, 'g');
// quoted bare ref occurrences
const quotedRefRe = new RegExp(String.raw`(['"\`])` + REF + String.raw`\1`, 'g');

function listFiles(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out = out.concat(listFiles(p));
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

const files = listFiles(SRC_DIR);
let changed = 0;

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;

  // 1) Replace base URL with env-based template (keep backticks)
  s = s.replace(urlRe, '`https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co`');

  // 2) Replace functions URL with env-based template
  s = s.replace(fnUrlRe, '`https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`');

  // 3) Normalize explicit SUPABASE_URL / functions base constants to use env if present
  s = s.replace(
    /const\s+SUPABASE_URL\s*=\s*(['"`]).*?supabase\.co\1/g,
    'const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co`'
  );
  s = s.replace(
    /const\s+(FUNCTIONS_BASE|EDGE)\s*=\s*(['"`]).*?functions\.supabase\.co\2/g,
    'const $1 = import.meta.env.VITE_SUPABASE_FUNCTIONS_BASE ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`'
  );

  // 4) Replace localStorage auth token key to be dynamic per project
  //    Force backticks to allow ${...}
  s = s.replace(
    tokenKeyRe,
    '${import.meta.env.VITE_SUPABASE_PROJECT_REF}-auth-token' // temp value, next step wraps in template
  );
  // Turn any occurrences like 'sb-${env}-auth-token' or "sb-${env}-auth-token" into backtick template
  s = s.replace(
    /(['"])\s*sb-\$\{import\.meta\.env\.VITE_SUPABASE_PROJECT_REF\}-auth-token\s*\1/g,
    '`sb-${import.meta.env.VITE_SUPABASE_PROJECT_REF}-auth-token`'
  );
  // If previous step didn't wrap, do a generic wrap for stray ${env}-auth-token
  s = s.replace(
    /\$\{import\.meta\.env\.VITE_SUPABASE_PROJECT_REF\}-auth-token/g,
    'sb-${import.meta.env.VITE_SUPABASE_PROJECT_REF}-auth-token'
  );
  // Ensure final token key template has proper sb- prefix in backticks
  s = s.replace(
    /(['"])(sb-\$\{import\.meta\.env\.VITE_SUPABASE_PROJECT_REF\}-auth-token)\1/g,
    '`$2`'
  );

  // 5) Replace quoted bare project ref with env template
  s = s.replace(quotedRefRe, '`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`');

  // 6) Normalize createClient(URL, KEY) first arg if URL literal slipped
  s = s.replace(
    /createClient\(\s*(['"`])https:\/\/[a-z0-9-]+\.supabase\.co\1\s*,/g,
    'createClient(import.meta.env.VITE_SUPABASE_URL ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co`,'
  );

  if (s !== orig) {
    fs.writeFileSync(f, s);
    changed++;
    console.log('patched:', f);
  }
}

console.log(`\nDone. Files changed: ${changed}`);
