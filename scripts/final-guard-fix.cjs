const fs = require('fs');

function ensureDir(f){ const d=f.split('/').slice(0,-1).join('/'); if(d && !fs.existsSync(d)) fs.mkdirSync(d,{recursive:true}); }

function patchFile(path, mut) {
  if (!fs.existsSync(path)) return false;
  const inText = fs.readFileSync(path,'utf8');
  const outText = mut(inText);
  if (outText !== inText) {
    ensureDir(path);
    fs.writeFileSync(path, outText);
    console.log('patched:', path);
    return true;
  }
  console.log('nochange:', path);
  return false;
}

function addAliasExportsToVapidLoader() {
  const f = 'src/lib/vapid-loader.ts';
  if (!fs.existsSync(f)) return;
  let s = fs.readFileSync(f,'utf8');
  const o = s;

  // Se manca loadVapidPublicKey, non toccare oltre (rispettiamo la catena esistente).
  if (!/loadVapidPublicKey/.test(s)) return;

  // Aggiungi alias sicuri solo se non già presenti
  if (!/export\s+async\s+function\s+getVapidPublicKey\s*\(/.test(s)) {
    s += `

/** Compatibility aliases (no-op proxies) */
export async function getVapidPublicKey(...args:any[]): Promise<string> {
  return await loadVapidPublicKey(...(args as []));
}
`;
  }
  if (!/export\s+async\s+function\s+fetchVapidKey\s*\(/.test(s)) {
    s += `
export async function fetchVapidKey(...args:any[]): Promise<string> {
  return await loadVapidPublicKey(...(args as []));
}
`;
  }

  if (s !== o) {
    fs.writeFileSync(f, s);
    console.log('patched:', f, '(alias exports added)');
  } else {
    console.log('nochange:', f);
  }
}

function fixUsePushNotifications() {
  const f = 'src/hooks/usePushNotifications.ts';
  if (!fs.existsSync(f)) return;

  patchFile(f, (s) => {
    let t = s;

    // 1) Rimuovi QUALSIASI import di getVapidPublicKey/fetchVapidKey non proveniente da @/lib/vapid-loader
    t = t.replace(/^\s*import\s*\{[^}]*getVapidPublicKey[^}]*\}\s*from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm, '');
    t = t.replace(/^\s*import\s*\{[^}]*fetchVapidKey[^}]*\}\s*from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm, '');
    t = t.replace(/^\s*import\s+getVapidPublicKey\s+from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm, '');
    t = t.replace(/^\s*import\s+fetchVapidKey\s+from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm, '');

    // 2) Normalizza eventuale import da vapid-loader a includere TUTTI i nomi (senza cambiare il codice che li usa)
    if (/from\s+['"]@\/lib\/vapid-loader['"]/.test(t)) {
      // sostituisci qualsiasi import da vapid-loader con il pacchetto completo dei nomi permessi
      t = t.replace(
        /import\s*\{[^}]*\}\s*from\s*['"]@\/lib\/vapid-loader['"];\s*/g,
        "import { loadVapidPublicKey, getVapidPublicKey, fetchVapidKey } from '@/lib/vapid-loader';\n"
      );
    } else {
      // se non presente, aggiungilo all'inizio
      t = `import { loadVapidPublicKey, getVapidPublicKey, fetchVapidKey } from '@/lib/vapid-loader';\n` + t;
    }

    // 3) NON cambiamo le chiamate esistenti (manteniamo piena compatibilità).
    //    L'import ora proviene dal modulo consentito, quindi il guard deve passare.

    return t;
  });
}

function scrubLeftoverSupabase() {
  // disableWebPush.ts → REST base
  patchFile('src/lib/push/disableWebPush.ts', (s) =>
    s.replace(
      /[`"']https:\/\/[a-z0-9.-]+\.supabase\.co\/rest\/v1[`"']/g,
      '`${import.meta.env.VITE_SUPABASE_URL ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co`}/rest/v1`'
    )
  );

  // initFcm.ts → functions base
  patchFile('src/lib/push/initFcm.ts', (s) =>
    s.replace(
      /[`"']https:\/\/[a-z0-9.-]+\.functions\.supabase\.co[`"']/g,
      '`${import.meta.env.VITE_SUPABASE_FUNCTIONS_BASE ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`}`'
    )
  );

  // Pagine test (facoltativo)
  patchFile('src/pages/M1ssionPushTest.tsx', (s) =>
    s.replace(/([`"'])vkjrqirvdvjbemsfzxof\1/g, '`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`')
  );
  patchFile('src/pages/DevStripeKeysSetup.tsx', (s) =>
    s.replace(/([`"'])vkjrqirvdvjbemsfzxof\1/g, '`${import.meta.env.VITE_SUPABASE_PROJECT_REF}`')
  );
}

addAliasExportsToVapidLoader();
fixUsePushNotifications();
scrubLeftoverSupabase();
console.log('done');
