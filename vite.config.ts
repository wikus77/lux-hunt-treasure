import { execSync } from 'node:child_process'
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ Treasure Hunt App - Custom Vite Configuration
// Optimized for Capacitor iOS/Android deployment with enhanced build settings

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from 'vite-plugin-checker';
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/functions/v1': 'http://localhost:54321'
    },
  },
  esbuild: {
    target: 'es2022', // Native class fields without helpers
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: mode === 'production' ? ['debugger'] : [],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean) as any,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'esnext',
    // Disable minification to fix MapLibre worker issue
    minify: false,
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'animation-vendor': ['framer-motion', 'lottie-react'],
          'three-vendor': ['three', '@react-three/drei'],
          'map-vendor': ['leaflet', 'react-leaflet', '@react-google-maps/api'],
          // maplibre-gl is bundled separately to fix worker issues
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      },
      external: [],
      onwarn(warning, warn) {
        if (warning.code === 'SOURCEMAP_ERROR') return;
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      }
    },
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    reportCompressedSize: false,
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
    __PWA_VERSION__: JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(
      process.env.VITE_BUILD_ID || `build-${Date.now().toString(36)}`
    ),
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      // Librerie con class fields che DEVONO essere pre-bundlate
      // 'maplibre-gl', // Excluded to fix worker issue
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
      'zustand',
      'zustand/middleware',
      '@supabase/supabase-js',
      'firebase/app',
      'firebase/auth',
      'firebase/messaging',
      'lottie-react',
      '@tanstack/react-query',
      'sonner',
      'gsap',
      'howler',
      'postprocessing',
    ],
    exclude: ['@capacitor/core', 'maplibre-gl'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  ssr: {
    noExternal: ['maplibre-gl', 'three', 'gsap'],
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.mp3', '**/*.wav']
}));