const fs = require('fs');
const f = 'src/hooks/usePushNotifications.ts';
if (!fs.existsSync(f)) { console.log('skip: usePushNotifications.ts non trovato'); process.exit(0); }
let s = fs.readFileSync(f,'utf8'); const o=s;

// rimuovi import non autorizzati di VAPID helpers
s = s.replace(/import\s*\{[^}]*getVapidPublicKey[^}]*\}\s*from\s*['"][^'"]+['"];?\n?/g,'');
s = s.replace(/import\s*\{[^}]*fetchVapidKey[^}]*\}\s*from\s*['"][^'"]+['"];?\n?/g,'');
s = s.replace(/import\s+getVapidPublicKey\s+from\s*['"][^'"]+['"];?\n?/g,'');
s = s.replace(/import\s+fetchVapidKey\s+from\s*['"][^'"]+['"];?\n?/g,'');

// imposta import ufficiale dal loader
if (!/from\s+['"]@\/lib\/vapid-loader['"]/.test(s)) {
  s = `import { loadVapidPublicKey } from '@/lib/vapid-loader';\n` + s;
} else {
  s = s.replace(/import\s*\{[^}]*\}\s*from\s*['"]@\/lib\/vapid-loader['"];?/,
                "import { loadVapidPublicKey } from '@/lib/vapid-loader';");
}

// uniforma chiamate
s = s.replace(/\b(getVapidPublicKey|fetchVapidKey|loadVapidKey)\s*\(/g,'loadVapidPublicKey(');

// se presente uso diretto di window.__VAPID__ o env, fallback alla funzione
s = s.replace(/(const\s+vapidKey\s*=\s*)(window\.__VAPID__|import\.meta\.env\.VITE_VAPID_PUBLIC_KEY)\s*;?/g,
              '$1await loadVapidPublicKey();');

if (s!==o){ fs.writeFileSync(f,s); console.log('patched:', f); } else { console.log('nochange:', f); }
