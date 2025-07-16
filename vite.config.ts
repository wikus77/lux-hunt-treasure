
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Treasure Hunt App - Custom Vite Configuration
// Optimized for Capacitor iOS/Android deployment with enhanced build settings

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
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
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Increase limit for necessary assets but exclude very large images
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        
        // Exclude large uploaded images from precaching
        globIgnores: [
          '**/lovable-uploads/**',
          '**/*.{png,jpg,jpeg}' // Exclude all images from precaching
        ],
        
        globPatterns: [
          '**/*.{js,css,html,ico,svg}', // Only cache essential files
          '**/assets/m1ssion/*.png' // Keep M1SSION icons for PWA
        ],
        
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/vkjrqirvdvjbemsfzxof\.supabase\.co/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Runtime cache for large uploaded images
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
            // Runtime cache for other images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // CSS and JS files
            urlPattern: /\.(?:css|js)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'assets/m1ssion/*.png'],
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
            src: '/assets/m1ssion/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/m1ssion/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/assets/m1ssion/icon-192.png',
            sizes: '180x180',
            type: 'image/png'
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
  // M1SSION™ Capacitor iOS Build Configuration - Custom Output
  base: mode === 'production' ? './' : '/',
  build: {
    outDir: 'dist', // Fixed: Reverting to standard dist directory for compatibility
    assetsDir: 'assets',
    // Fixed minification settings for Capacitor iOS
    target: 'es2015',
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Static asset naming for Capacitor compatibility
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'animation-vendor': ['framer-motion', 'lottie-react']
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
        drop_console: false, // Keep console for debugging in production
        drop_debugger: mode === 'production',
        keep_fnames: true,
        keep_classnames: true,
        // Prevent unsafe optimizations
        pure_funcs: [],
        unsafe: false,
        unsafe_comps: false,
      },
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
        reserved: [
          // Critical React functions
          'React', 'ReactDOM', 'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
          // Router functions
          'useNavigate', 'useLocation', 'useParams', 'Link', 'Navigate', 'Routes', 'Route',
          // Capacitor functions
          'Capacitor', 'SplashScreen', 'StatusBar', 'Device', 'App',
          // Supabase functions
          'supabase', 'createClient', 'from', 'select', 'insert', 'update', 'delete',
          // Animation functions
          'motion', 'AnimatePresence', 'useAnimation', 'framer',
          // Custom components
          'BottomNavigationComponent', 'explicitNavigationHandler', 'explicitAuthHandler'
        ]
      },
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
