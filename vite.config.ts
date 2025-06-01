import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Import ESM corretto
import * as lovableTagger from "lovable-tagger"; // importa tutto come oggetto

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Chiama la funzione principale se esiste
    (lovableTagger.default ?? lovableTagger)(), 
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
