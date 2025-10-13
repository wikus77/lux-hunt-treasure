const fs = require('fs');
const file = 'src/hooks/usePushNotifications.ts';
if (!fs.existsSync(file)) process.exit(0);
let s = fs.readFileSync(file, 'utf8');
const o = s;

// 1) Rimuovi qualsiasi import/require/dynamic import legato a VAPID non dal loader ufficiale
s = s.replace(/^\s*import\s+\{[^}]*getVapidPublicKey[^}]*\}\s+from\s+['"][^'"]+['"];\s*$/igm, '');
s = s.replace(/^\s*import\s+\{[^}]*fetchVapidKey[^}]*\}\s+from\s+['"][^'"]+['"];\s*$/igm, '');
s = s.replace(/^\s*import\s+getVapidPublicKey\s+from\s+['"][^'"]+['"];\s*$/igm, '');
s = s.replace(/^\s*import\s+fetchVapidKey\s+from\s+['"][^'"]+['"];\s*$/igm, '');
s = s.replace(/^\s*import\s+\{[^}]*\}\s+from\s+['"]@\/lib\/vapid-loader['"];\s*$/igm, '');
s = s.replace(/^\s*const\s*\{\s*getVapidPublicKey[^}]*\}\s*=\s*await\s*import\(['"][^'"]+['"]\);\s*$/igm, '');
s = s.replace(/^\s*const\s*\{\s*fetchVapidKey[^}]*\}\s*=\s*await\s*import\(['"][^'"]+['"]\);\s*$/igm, '');
s = s.replace(/^\s*const\s+getVapidPublicKey\s*=\s*require\(['"][^'"]+['"]\);\s*$/igm, '');
s = s.replace(/^\s*const\s+fetchVapidKey\s*=\s*require\(['"][^'"]+['"]\);\s*$/igm, '');

// 2) Inserisci SOLO l’import consentito in testa al file (se non c’è già)
if (!/from\s+['"]@\/lib\/vapid-loader['"]/.test(s)) {
  s = `import { loadVapidPublicKey } from '@/lib/vapid-loader';\n` + s;
} else {
  // Normalizza per essere ESATTO
  s = s.replace(/import\s*\{[^}]*\}\s*from\s*['"]@\/lib\/vapid-loader['"];\s*/g,
                "import { loadVapidPublicKey } from '@/lib/vapid-loader';\n");
}

// 3) Sostituisci ovunque (anche in commenti e stringhe) i nomi helper proibiti → loadVapidPublicKey
s = s.replace(/getVapidPublicKey/g, 'loadVapidPublicKey');
s = s.replace(/fetchVapidKey/g, 'loadVapidPublicKey');

// 4) Vietato usare env/window per la key: forza uso del loader
s = s.replace(/(const\s+vapidKey\s*=\s*)(window\.__VAPID__|import\.meta\.env\.VITE_VAPID_PUBLIC_KEY)(\s*;?)/g,
              '$1await loadVapidPublicKey()$3');

// 5) Salva se modificato
if (s !== o) {
  fs.writeFileSync(file, s);
  console.log('patched:', file);
} else {
  console.log('nochange:', file);
}
