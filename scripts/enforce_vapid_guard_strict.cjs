const fs = require('fs');
const F = 'src/hooks/usePushNotifications.ts';
if (!fs.existsSync(F)) process.exit(0);
let s = fs.readFileSync(F,'utf8'), o = s;

// rimuovi TUTTI gli import non consentiti
s = s.replace(/^\s*import\s*\{[^}]*getVapidPublicKey[^}]*\}\s*from\s*['"][^'"]+['"];\s*\n/igm,'');
s = s.replace(/^\s*import\s*\{[^}]*fetchVapidKey[^}]*\}\s*from\s*['"][^'"]+['"];\s*\n/igm,'');
s = s.replace(/^\s*import\s+getVapidPublicKey\s+from\s*['"][^'"]+['"];\s*\n/igm,'');
s = s.replace(/^\s*import\s+fetchVapidKey\s+from\s*['"][^'"]+['"];\s*\n/igm,'');
// rimuovi qualsiasi import da '@/lib/vapid-loader' e re-inserisci quello corretto
s = s.replace(/^\s*import\s*\{[^}]*\}\s*from\s*['"]@\/lib\/vapid-loader['"];\s*\n/igm,'');
s = `import { loadVapidPublicKey } from '@/lib/vapid-loader';\n` + s;

// sostituisci chiamate helper legacy
s = s.replace(/\b(getVapidPublicKey|fetchVapidKey|loadVapidKey)\s*\(/g, 'loadVapidPublicKey(');

// rimuovi qualsiasi traccia testuale (commenti/stringhe) dei nomi proibiti
s = s.replace(/getVapidPublicKey/g, 'loadVapidPublicKey');
s = s.replace(/fetchVapidKey/g, 'loadVapidPublicKey');

// vieta uso diretto env/window
s = s.replace(/(const\s+vapidKey\s*=\s*)(window\.__VAPID__|import\.meta\.env\.VITE_VAPID_PUBLIC_KEY)(\s*;?)/g, '$1await loadVapidPublicKey()$3');

if (s !== o) { fs.writeFileSync(F, s); console.log('patched:', F); } else { console.log('nochange:', F); }
