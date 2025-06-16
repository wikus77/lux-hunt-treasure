
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8080,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.turbo/**',
        '**/.cache/**',
        '**/.output/**',
        '**/.vercel/**',
        '**/ios/**',
        '**/android/**',
        '**/public/lovable-uploads/**',
        '**/tests/**',
        '**/*.spec.ts',
        '**/*.test.ts'
      ]
    },
    fs: {
      strict: false
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
