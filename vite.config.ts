import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// ❌ ATTENZIONE: rimosso `lovable-tagger` perché incompatibile con CommonJS
// Se in futuro passerai a ESM puro, potrai reintegrarlo in modo corretto

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
