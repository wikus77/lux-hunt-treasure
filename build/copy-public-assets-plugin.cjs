/**
 * Phase Performance 1 — Safe Build Pipeline Reduction
 * Vite plugin: copy only whitelisted public assets to dist (no full public/ copy).
 * Reads build/asset-whitelist.json; copies rootFiles, dirs, and lovableUploads only.
 * Also creates dist/public/lovable-uploads/ for EventsPage (/public/lovable-uploads/ path).
 * Removes dist/bundle-analysis.html after copy to reduce sync size.
 */
const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyPublicAssetsPlugin() {
  return {
    name: 'copy-public-assets',
    closeBundle() {
      const root = process.cwd();
      const publicDir = path.join(root, 'public');
      const distDir = path.join(root, 'dist');
      const whitelistPath = path.join(root, 'build', 'asset-whitelist.json');

      if (!fs.existsSync(whitelistPath)) {
        console.warn('[copy-public-assets] build/asset-whitelist.json not found, skipping.');
        return;
      }

      const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

      // Root files
      for (const f of whitelist.rootFiles || []) {
        const src = path.join(publicDir, f);
        if (fs.existsSync(src)) {
          const dest = path.join(distDir, f);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
        }
      }

      // Full directories
      for (const d of whitelist.dirs || []) {
        const src = path.join(publicDir, d);
        const dest = path.join(distDir, d);
        if (fs.existsSync(src)) copyRecursive(src, dest);
      }

      // Lovable uploads: only whitelisted files → dist/lovable-uploads and dist/public/lovable-uploads
      const luDest = path.join(distDir, 'lovable-uploads');
      const luPublicDest = path.join(distDir, 'public', 'lovable-uploads');
      fs.mkdirSync(luDest, { recursive: true });
      fs.mkdirSync(luPublicDest, { recursive: true });
      const luSrc = path.join(publicDir, 'lovable-uploads');
      for (const f of whitelist.lovableUploads || []) {
        const src = path.join(luSrc, f);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(luDest, f));
          fs.copyFileSync(src, path.join(luPublicDest, f));
        }
      }

      // Remove bundle-analysis.html from dist (not needed at runtime, reduces cap sync)
      const bundleAnalysis = path.join(distDir, 'bundle-analysis.html');
      if (fs.existsSync(bundleAnalysis)) {
        fs.unlinkSync(bundleAnalysis);
      }

      console.log('[copy-public-assets] Whitelisted public assets copied to dist.');
    },
  };
}

module.exports = copyPublicAssetsPlugin;
