
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
    // Capacitor iOS optimizations
    target: 'es2015',
    minify: 'terser',
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
    // Capacitor iOS specific optimizations
    emptyOutDir: true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1000,
  },
  // iOS Safari compatibility
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@capacitor/core']
  }
}));
