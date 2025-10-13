const fs = require('fs');
const F = 'src/hooks/usePushNotifications.ts';
if (!fs.existsSync(F)) process.exit(0);
let s = fs.readFileSync(F, 'utf8'); const o = s;

s = s.replace(/^\s*import\s+[^;]*vapid[^;]*;\s*\n/igm, '');
s = s.replace(/^\s*import\s*\{[^}]*getVapidPublicKey[^}]*\}\s*from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm,'');
s = s.replace(/^\s*import\s*\{[^}]*fetchVapidKey[^}]*\}\s*from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm,'');
s = s.replace(/^\s*import\s+getVapidPublicKey\s+from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm,'');
s = s.replace(/^\s*import\s+fetchVapidKey\s+from\s*['"](?!@\/lib\/vapid-loader)['"][^'"]+['"];\s*\n/igm,'');
s = s.replace(/^\s*import\s*\{[^}]*\}\s*from\s*['"]@\/lib\/vapid-loader['"];\s*\n/igm, '');
s = `import { getVapidPublicKey } from '@/lib/vapid-loader';\n` + s;

s = s.replace(/\b(loadVapidPublicKey|fetchVapidKey)\s*\(/g, 'getVapidPublicKey(');
s = s.replace(/(const\s+vapidKey\s*=\s*)(window\.__VAPID__|import\.meta\.env\.VITE_VAPID_PUBLIC_KEY)(\s*;?)/g, '$1await getVapidPublicKey()$3');

if (s !== o) { fs.writeFileSync(F, s); console.log('patched:', F); } else { console.log('nochange:', F); }
