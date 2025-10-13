const fs = require('fs');
const F = 'src/hooks/usePushNotifications.ts';
if (!fs.existsSync(F)) { console.error('missing', F); process.exit(1); }
let s = fs.readFileSync(F, 'utf8');
const o = s;

/* 1) Rimuovi TUTTI gli import VAPID non dal loader ufficiale */
s = s.replace(/^\s*import\s*\{[^}]*getVapidPublicKey[^}]*\}\s*from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm, '');
s = s.replace(/^\s*import\s*\{[^}]*fetchVapidKey[^}]*\}\s*from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm, '');
s = s.replace(/^\s*import\s+getVapidPublicKey\s+from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm, '');
s = s.replace(/^\s*import\s+fetchVapidKey\s+from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm, '');
/* rimuovi eventuali import da loader con nomi diversi */
s = s.replace(/^\s*import\s*\{[^}]*\}\s*from\s*['"]@\/lib\/vapid-loader['"];\s*\n/igm, '');

/* 2) Aggiungi SOLO l'import consentito */
s = `import { loadVapidPublicKey } from '@/lib/vapid-loader';\n` + s;

/* 3) Sostituisci chiamate a helper non consentiti con loadVapidPublicKey */
s = s.replace(/\b(getVapidPublicKey|fetchVapidKey|loadVapidKey)\s*\(/g, 'loadVapidPublicKey(');

/* 4) Evita uso diretto env/window per la VAPID key (usa sempre il loader) */
s = s.replace(
  /(const\s+vapidKey\s*=\s*)(window\.__VAPID__|import\.meta\.env\.VITE_VAPID_PUBLIC_KEY)(\s*;?)/g,
  '$1await loadVapidPublicKey()$3'
);

/* 5) Come ulteriore safety: elimina qualunque ident a stringa in-file "getVapidPublicKey|fetchVapidKey" */
s = s.replace(/getVapidPublicKey/g, 'loadVapidPublicKey')
     .replace(/fetchVapidKey/g, 'loadVapidPublicKey');

if (s !== o) {
  fs.writeFileSync(F, s);
  console.log('patched:', F);
} else {
  console.log('nochange:', F);
}
