// © 2025 Joseph MULÉ – M1SSION™
import base from './vite.config';
import { defineConfig, mergeConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig((env) => {
  const baseCfg: any = typeof base === 'function' ? (base as any)(env) : base;
  return mergeConfig(baseCfg, {
    build: {
      rollupOptions: {
        plugins: [
          visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap'
          })
        ]
      }
    }
  });
});
