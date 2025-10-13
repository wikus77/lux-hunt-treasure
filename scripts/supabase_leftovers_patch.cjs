const fs = require('fs');

function patch(file, pairs){
  if (!fs.existsSync(file)) return console.log('skip:', file);
  let s = fs.readFileSync(file,'utf8'), o=s;
  for (const [re,rep] of pairs) s = s.replace(re, rep);
  if (s !== o) { fs.writeFileSync(file,s); console.log('patched:', file); } else { console.log('nochange:', file); }
}

const BASE='${import.meta.env.VITE_SUPABASE_URL ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co`}';
const FN='${import.meta.env.VITE_SUPABASE_FUNCTIONS_BASE ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`}';

patch('src/lib/push/disableWebPush.ts', [
  [/`https:\/\/[a-z0-9.-]+\.supabase\.co\/rest\/v1/g, '`'+BASE+'/rest/v1'],
]);

patch('src/lib/push/initFcm.ts', [
  [/["'`]https:\/\/[a-z0-9.-]+\.functions\.supabase\.co["'`]/g, '`'+FN+'`'],
]);

patch('src/pages/M1ssionPushTest.tsx', [
  [/([`"'])vkjrqirvdvjbemsfzxof\1/g, '`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`'],
]);

patch('src/pages/DevStripeKeysSetup.tsx', [
  [/([`"'])vkjrqirvdvjbemsfzxof\1/g, '`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`'],
]);
