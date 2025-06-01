import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import lovableTagger from "lovable-tagger"; // ✅ Import ESM compatibile

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    lovableTagger(), // ✅ Usa il plugin correttamente
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
