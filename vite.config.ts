import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// ⚠️ RIMOSSO: import { componentTagger } from "lovable-tagger";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
    // ⚠️ RIMOSSO: componentTagger() perché causa errore con ESM
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
