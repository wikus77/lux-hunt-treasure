const fs = require('fs');
const path = require('path');

const FILES = [
  'src/contexts/auth/AuthProvider.tsx',
  'src/utils/security-hardening.ts',
  'src/utils/markerApi.ts',
  'src/utils/session-security.ts',
  'src/integrations/supabase/client.ts',
  'src/push/ensurePushSubscription.ts',
  'src/hooks/use-auth-session-manager.ts',
  'src/lib/qr/api.ts',
  'src/lib/supabase/functionsBase.ts',
  'src/lib/push/disableWebPush.ts',
  'src/lib/push/initFcm.ts',
  'src/pages/settings/SettingsPage.tsx',
  'src/pages/M1ssionPushTest.tsx',
  'src/pages/DevStripeKeysSetup.tsx'
].filter(f => fs.existsSync(f));

const BASE = 'import.meta.env.VITE_SUPABASE_URL ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co`';
const FN   = 'import.meta.env.VITE_SUPABASE_FUNCTIONS_BASE ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`';
const REF  = 'vkjrqirvdvjbemsfzxof';

function patch(file) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;

  // token key → dinamico (qualsiasi quote)
  s = s.replace(/(['"`])\s*sb-vkjrqirvdvjbemsfzxof-auth-token\s*\1/g,
                '`sb-${import.meta.env.VITE_SUPABASE_PROJECT_REF}-auth-token`');

  // project ref nudo quotato → template
  s = s.replace(new RegExp(String.raw`(['"\`])\s*`+REF+String.raw`\s*\1`, 'g'),
                '`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`');

  // URLs functions → env
  s = s.replace(/['"`]https:\/\/[a-z0-9.-]+\.functions\.supabase\.co['"`]/g,
                '`' + FN + '`');

  // URLs base → env
  s = s.replace(/['"`]https:\/\/[a-z0-9.-]+\.supabase\.co['"`]/g,
                '`' + BASE + '`');

  // const SUPABASE_URL → env
  s = s.replace(/const\s+SUPABASE_URL\s*=\s*['"`].*?supabase\.co['"`]/g,
                'const SUPABASE_URL = ' + BASE);

  // const EDGE/FUNCTIONS_BASE → env
  s = s.replace(/const\s+(EDGE|FUNCTIONS_BASE)\s*=\s*['"`].*?functions\.supabase\.co['"`]/g,
                'const $1 = ' + FN);

  // createClient(URL, KEY) primo argomento → env
  s = s.replace(/createClient\(\s*['"`]https:\/\/[a-z0-9.-]+\.supabase\.co['"`]\s*,/g,
                'createClient(' + BASE + ',');
  
  // return ... /functions/v1 → env
  s = s.replace(/return\s+['"`]https:\/\/[a-z0-9.-]+\.supabase\.co\/functions\/v1['"`]/g,
                'return (' + FN + '.replace(/\\/$/, "") + "/functions/v1")');

  if (s !== orig) {
    fs.writeFileSync(file, s);
    console.log('patched:', file);
  }
}

for (const f of FILES) patch(f);

// Passata finale su tutto src (sicura)
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):(/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name)?[p]:[]);});}
for(const f of walk('src')){
  let s = fs.readFileSync(f,'utf8'), o=s;
  s = s.replace(/(['"`])\s*sb-vkjrqirvdvjbemsfzxof-auth-token\s*\1/g,'`sb-${import.meta.env.VITE_SUPABASE_PROJECT_REF}-auth-token`');
  s = s.replace(new RegExp(String.raw`(['"\`])\s*`+REF+String.raw`\s*\1`,'g'),'`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`');
  if(s!==o){fs.writeFileSync(f,s);console.log('patched:',f);}
}
console.log('done');
