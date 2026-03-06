#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const catalog = fs.readFileSync(path.join(root, 'src/components/agent/agentCatalog.ts'), 'utf8');
const assets = fs.readFileSync(path.join(root, 'src/components/agent/agentAssets.ts'), 'utf8');

const catalogPaths = [...catalog.matchAll(/glbPath:\s*['"]([^'"]+)['"]/g)].map(m => m[1].replace(/^\//, ''));
const assetPaths = [...assets.matchAll(/glbPath:\s*['"]([^'"]+)['"]/g)].map(m => m[1].replace(/^\//, ''));
const allReferenced = [...new Set([...catalogPaths, ...assetPaths])];

function findGlb(dir, base = '') {
  let out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? base + '/' + e.name : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(findGlb(full, rel));
    else if (e.name.endsWith('.glb')) out.push({ rel, size: fs.statSync(full).size });
  }
  return out;
}
const publicDir = path.join(root, 'public', 'models');
const onDisk = findGlb(publicDir, 'models');

const refSet = new Set(allReferenced);
const used = [];
const unused = [];
let usedBytes = 0, unusedBytes = 0;
for (const { rel, size } of onDisk) {
  const normalized = rel.split(path.sep).join('/');
  if (refSet.has(normalized)) { used.push({ path: normalized, size }); usedBytes += size; }
  else { unused.push({ path: normalized, size }); unusedBytes += size; }
}
used.sort((a,b) => b.size - a.size);
unused.sort((a,b) => b.size - a.size);

const diskPaths = new Set(onDisk.map(d => d.rel.split(path.sep).join('/')));
const missing = allReferenced.filter(p => !diskPaths.has(p));

function fmt(b) { return (b / 1024 / 1024).toFixed(2) + ' MB'; }
function fmtKb(b) { return (b / 1024).toFixed(1) + ' KB'; }

const lines = [];
lines.push('# Audit file .glb – riferimenti in codice e su disco\n');
lines.push('## Riepilogo\n');
lines.push('| Categoria | Numero file | Dimensione totale |');
lines.push('|-----------|-------------|-------------------|');
lines.push('| **Utilizzati** (in codice e su disco) | ' + used.length + ' | ' + fmt(usedBytes) + ' |');
lines.push('| **Non utilizzati** (solo su disco) | ' + unused.length + ' | ' + fmt(unusedBytes) + ' |');
lines.push('| **Referenziati ma mancanti** | ' + missing.length + ' | — |');
lines.push('| **Totale .glb su disco** | ' + onDisk.length + ' | **' + fmt(usedBytes + unusedBytes) + '** |');
lines.push('\n## Utilizzati (dimensione singola file)\n');
lines.push('| Dimensione | Path |');
lines.push('|------------|------|');
used.forEach(u => lines.push('| ' + (u.size < 1024*1024 ? fmtKb(u.size) : fmt(u.size)) + ' | `' + u.path + '` |'));
lines.push('\n## Non utilizzati (su disco, non referenziati in codice)\n');
lines.push('| Dimensione | Path |');
lines.push('|------------|------|');
unused.forEach(u => lines.push('| ' + (u.size < 1024*1024 ? fmtKb(u.size) : fmt(u.size)) + ' | `' + u.path + '` |'));
if (missing.length) {
  lines.push('\n## Referenziati in codice ma mancanti su disco\n');
  missing.forEach(m => lines.push('- `' + m + '`'));
}
fs.writeFileSync(path.join(root, 'reports/GLB_FILES_AUDIT.md'), lines.join('\n'));
console.log('Report scritto in reports/GLB_FILES_AUDIT.md');
console.log('Utilizzati:', used.length, fmt(usedBytes));
console.log('Non utilizzati:', unused.length, fmt(unusedBytes));
console.log('Mancanti:', missing.length);
