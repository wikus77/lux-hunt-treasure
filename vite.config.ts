import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import lovableTagger from "lovable-tagger/dist/index.js";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    lovableTagger(), // chiamata diretta
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
