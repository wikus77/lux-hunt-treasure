// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ Treasure Hunt App - Custom Vite Configuration
// Optimized for Capacitor iOS/Android deployment with enhanced build settings

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
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
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: mode === 'production' ? ['console', 'debugger'] : [],
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
    VitePWA({
      // Disable automatic service worker registration to use custom Firebase SW
      injectRegister: null,
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB - increased for large bundle
        // Don't generate default service worker - we use firebase-messaging-sw.js
        skipWaiting: true,
        clientsClaim: true,
        globIgnores: [
          '**/lovable-uploads/**',
          '**/*.{png,jpg,jpeg}', // Exclude all images from precaching
          '**/assets/index.*.js', // Exclude large main bundle from precaching
          '**/functions/v1/**' // Exclude edge function calls from caching
        ],
        globPatterns: [
          '**/*.{css,html,ico,svg}', // Cache essential files but not large JS bundles
          '**/assets/!(index).*.js' // Cache vendor chunks but not main bundle
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/vkjrqirvdvjbemsfzxof\.supabase\.co\/rest\/v1\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/vkjrqirvdvjbemsfzxof\.supabase\.co\/auth\/v1\/.*/,
            handler: 'NetworkOnly', // Never cache auth requests
          },
          {
            urlPattern: /^https:\/\/vkjrqirvdvjbemsfzxof\.supabase\.co\/functions\/v1\/.*/,
            handler: 'NetworkOnly', // Never cache edge function calls
          },
          {
            urlPattern: /\/lovable-uploads\/.*\.(?:png|jpg|jpeg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'large-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'M1SSION™',
        short_name: 'M1SSION',
        description: 'Un\'esperienza di gioco rivoluzionaria che unisce caccia al tesoro, enigmi e premi esclusivi',
        theme_color: '#00D1FF',
        background_color: '#000C18',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    minify: mode === 'production' ? 'terser' : false,
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
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Drop all console logs in production
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug', 'console.warn'] : [],
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false,
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@capacitor/core'],
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.mp3', '**/*.wav']
}));