// © 2025 Joseph MULÉ – M1SSION™ – Vite PROD PERF (Guard-safe)
import base from './vite.config';
import { defineConfig, mergeConfig } from 'vite';

export default defineConfig((env) => {
  const baseCfg: any = typeof base === 'function' ? (base as any)(env) : base;
  return mergeConfig(baseCfg, {
    build: {
      sourcemap: false,
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true, passes: 2 },
        mangle: true,
        format: { comments: false }
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
              if (id.includes('@supabase/supabase-js')) return 'supabase-vendor';
              if (id.includes('leaflet')) return 'map-vendor';
              if (id.includes('gsap') || id.includes('lottie-web')) return 'animation-vendor';
              if (id.includes('html2canvas')) return 'html2canvas';
              if (id.includes('wouter')) return 'router-vendor';
            }
          }
        }
      }
    }
  });
});
