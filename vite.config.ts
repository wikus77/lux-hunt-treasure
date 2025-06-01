import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// ❌ Rimosso: non compatibile con CommonJS
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' && componentTagger(), // ← Disattivato temporaneamente
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
