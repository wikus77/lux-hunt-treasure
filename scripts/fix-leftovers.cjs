const fs = require('fs');

function patch(file, transforms) {
  if (!fs.existsSync(file)) return;
  let s = fs.readFileSync(file, 'utf8');
  const o = s;
  for (const [re, rep] of transforms) s = s.replace(re, rep);
  if (s !== o) { fs.writeFileSync(file, s); console.log('patched:', file); }
}

// 1) Rest URL hardcodata → env template
patch('src/lib/push/disableWebPush.ts', [
  [
    /["'`]{1}https:\/\/[a-z0-9.-]+\.supabase\.co\/rest\/v1["'`]{1}/g,
    '`${import.meta.env.VITE_SUPABASE_URL ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co`}/rest/v1`'
  ]
]);

// 2) Functions host hardcodato → env template
patch('src/lib/push/initFcm.ts', [
  [
    /["'`]{1}https:\/\/[a-z0-9.-]+\.functions\.supabase\.co["'`]{1}/g,
    '`${import.meta.env.VITE_SUPABASE_FUNCTIONS_BASE ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`}`'
  ]
]);

// 3) Pagine di test: ref visivo → env (opzionale ma pulito)
patch('src/pages/M1ssionPushTest.tsx', [
  [ /([`"'])vkjrqirvdvjbemsfzxof\1/g, '`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`' ]
]);
patch('src/pages/DevStripeKeysSetup.tsx', [
  [ /([`"'])vkjrqirvdvjbemsfzxof\1/g, '`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`' ]
]);

console.log('done');
