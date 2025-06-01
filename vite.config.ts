import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// ❌ Disabilitato temporaneamente per evitare errore ESM con esbuild
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' && componentTagger(), // 🔁 Rimuovi commento solo se configurato come ESM puro
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
