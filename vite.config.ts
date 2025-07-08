
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Capacitor iOS Build Configuration
  base: mode === 'production' ? './' : '/',
  build: {
    outDir: 'dist',
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
    // Terser options for iOS compatibility - PRESERVE FUNCTION NAMES
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        // Preserve function names for iOS Capacitor compatibility
        keep_fnames: true,
        keep_classnames: true,
      },
      mangle: {
        // Disable mangling to prevent minified function names
        keep_fnames: true,
        keep_classnames: true,
        reserved: [
          // Preserve React/ReactDOM function names
          'React', 'ReactDOM', 'useState', 'useEffect', 'useCallback', 'useMemo',
          // Preserve router function names
          'useNavigate', 'useLocation', 'Link', 'Router', 'Routes', 'Route',
          // Preserve Capacitor function names
          'Capacitor', 'CapacitorApp', 'StatusBar', 'SplashScreen',
          // Preserve Supabase function names
          'supabase', 'createClient', 'signInWithPassword', 'signUp',
          // Preserve animation function names
          'motion', 'AnimatePresence', 'framerMotion',
          // Preserve UI component names
          'Button', 'Dialog', 'Toast', 'Card', 'Avatar', 'Badge'
        ]
      },
      format: {
        comments: false,
        // Preserve function names in output
        keep_fnames: true,
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
