import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Importa come CommonJS
import lovableTagger from "lovable-tagger";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    lovableTagger(), // Chiama direttamente il plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
