
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Treasure Hunt App - Custom Vite Configuration
// Optimized for Capacitor iOS/Android deployment with enhanced build settings

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/functions/v1': 'http://localhost:54321'
    },
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // M1SSION™ Capacitor iOS Build Configuration - Custom Output
  base: mode === 'production' ? './' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2015',
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: false,
    rollupOptions: {
      treeshake: {
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        moduleSideEffects: false
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lottie')) {
              return 'animation-vendor';
            }
            return 'vendor';
          }
        }
      }
    },
    // Enhanced Capacitor iOS optimizations
    emptyOutDir: true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1000,
    // Enhanced Terser options for iOS Capacitor compatibility
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: mode === 'production',
        keep_fnames: true,
        keep_classnames: true,
        pure_funcs: [],
        unsafe: false,
        unsafe_comps: false,
        passes: 1,
        sequences: false,
        conditionals: false,
        evaluate: false,
        hoist_funs: false,
        hoist_vars: false,
        join_vars: false,
        collapse_vars: false,
        reduce_vars: false,
        side_effects: false
      },
      mangle: false,
      format: {
        comments: false,
        keep_fnames: true,
        preserve_annotations: true,
      },
    },
  },
  // iOS Safari compatibility - EXPLICIT GLOBALS
  define: {
    global: 'globalThis',
    // Prevent minification of critical React functions
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@capacitor/core'],
    // Force explicit imports to prevent minification issues
    force: true
  },
  // Improved asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.mp3', '**/*.wav']
}));
