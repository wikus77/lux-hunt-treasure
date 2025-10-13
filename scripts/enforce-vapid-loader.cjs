const fs = require('fs');
const f = 'src/hooks/usePushNotifications.ts';
if(!fs.existsSync(f)){ console.log('skip: missing', f); process.exit(0); }
let s = fs.readFileSync(f,'utf8'); const o=s;

// 1) Kill any VAPID-related imports not from the official loader
s = s.replace(/^\s*import[^\n]*vapid[^\n]*\n/gi, '');
s = s.replace(/^\s*import\s*\{[^}]*getVapidPublicKey[^}]*\}\s*from\s*['"][^'"]+['"];\s*\n/gi, '');
s = s.replace(/^\s*import\s*\{[^}]*fetchVapidKey[^}]*\}\s*from\s*['"][^'"]+['"];\s*\n/gi, '');
s = s.replace(/^\s*import\s+getVapidPublicKey\s+from\s*['"][^'"]+['"];\s*\n/gi, '');
s = s.replace(/^\s*import\s+fetchVapidKey\s+from\s*['"][^'"]+['"];\s*\n/gi, '');

// 2) Ensure single allowed import (top of file)
if(!/from\s+['"]@\/lib\/vapid-loader['"]/.test(s)){
  s = `import { loadVapidPublicKey } from '@/lib/vapid-loader';\n` + s;
}else{
  s = s.replace(/import\s*\{[^}]*\}\s*from\s*['"]@\/lib\/vapid-loader['"];\s*/,
                "import { loadVapidPublicKey } from '@/lib/vapid-loader';\n");
}

// 3) Disallow direct env/window usage for VAPID key
s = s.replace(/(const\s+vapidKey\s*=\s*)(window\.__VAPID__|import\.meta\.env\.VITE_VAPID_PUBLIC_KEY)(\s*;?)/g,
              '$1await loadVapidPublicKey()$3');

// 4) Normalize any legacy helper calls to the official one
s = s.replace(/\b(getVapidPublicKey|fetchVapidKey|loadVapidKey)\s*\(/g, 'loadVapidPublicKey(');

// 5) As ultima ratio: replace any string reads like process.env/ENV_VAPID with loader
s = s.replace(/(['"`])VAPID(_PUBLIC)?_KEY\1/g, '`await loadVapidPublicKey()`');

// 6) Save if changed
if(s!==o){ fs.writeFileSync(f,s); console.log('patched:', f); } else { console.log('nochange:', f); }
