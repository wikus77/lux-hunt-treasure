
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import * as lovableTaggerModule from "lovable-tagger";

// Estrai manualmente la funzione se esiste
const lovableTagger = (lovableTaggerModule as any).default || lovableTaggerModule;

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    typeof lovableTagger === "function" ? lovableTagger() : [],
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
