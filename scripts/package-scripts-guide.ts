/**
 * M1SSION™ PWA - Production Scripts Guide
 * 
 * Since package.json is read-only, these scripts need to be added manually:
 */

// Add to package.json scripts section:
const SCRIPTS_TO_ADD = {
  "prebuild": "tsx scripts/check-env.ts",
  "build:analyze": "npm run build && npx vite-bundle-analyzer dist",
  "check-env": "tsx scripts/check-env.ts",
  "test:lighthouse": "lhci autorun",
  "security:audit": "npm audit --audit-level moderate"
};

// Manual package.json update needed:
/*
{
  "scripts": {
    "dev": "vite",
    "prebuild": "tsx scripts/check-env.ts",
    "build": "tsc && vite build",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist",
    "check-env": "tsx scripts/check-env.ts",
    "test:lighthouse": "lhci autorun",
    "security:audit": "npm audit --audit-level moderate",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
*/

export { SCRIPTS_TO_ADD };