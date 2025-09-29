// vite.config.ts
import { defineConfig } from "file:///Users/josephmule/Desktop/m1ssion-full/node_modules/.pnpm/vite@5.4.20_@types+node@22.18.6_terser@5.44.0/node_modules/vite/dist/node/index.js";
import react from "file:///Users/josephmule/Desktop/m1ssion-full/node_modules/.pnpm/@vitejs+plugin-react-swc@3.11.0_vite@5.4.20_@types+node@22.18.6_terser@5.44.0_/node_modules/@vitejs/plugin-react-swc/index.js";
import { componentTagger } from "file:///Users/josephmule/Desktop/m1ssion-full/node_modules/.pnpm/lovable-tagger@1.1.10_vite@5.4.20_@types+node@22.18.6_terser@5.44.0_/node_modules/lovable-tagger/dist/index.js";
import { visualizer } from "file:///Users/josephmule/Desktop/m1ssion-full/node_modules/.pnpm/rollup-plugin-visualizer@6.0.3_rollup@4.52.3/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import path from "node:path";
var __vite_injected_original_dirname = "/Users/josephmule/Desktop/m1ssion-full";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/functions/v1": "http://localhost:54321"
    }
  },
  esbuild: {
    target: "es2020",
    logOverride: { "this-is-undefined-in-esm": "silent" },
    // In produzione NON droppiamo "console" a livello esbuild per preservare error/warn.
    // La rimozione selettiva di log/info/debug è gestita da Terser (pure_funcs) in build.
    drop: mode === "production" ? ["debugger"] : []
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && visualizer({
      filename: "dist/bundle-analysis.html",
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    target: "es2020",
    minify: mode === "production" ? "terser" : false,
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "router-vendor": ["react-router-dom"],
          "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-toast"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "animation-vendor": ["framer-motion", "lottie-react"],
          "three-vendor": ["three", "@react-three/drei"],
          "map-vendor": ["leaflet", "react-leaflet", "@react-google-maps/api"],
          "stripe-vendor": ["@stripe/stripe-js", "@stripe/react-stripe-js"]
        }
      },
      external: [],
      onwarn(warning, warn) {
        if (warning.code === "SOURCEMAP_ERROR") return;
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      }
    },
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2e3,
    reportCompressedSize: false,
    terserOptions: {
      compress: {
        drop_console: false,
        // Keep console for error debugging
        drop_debugger: true,
        pure_funcs: mode === "production" ? ["console.log", "console.info", "console.debug"] : []
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    }
  },
  define: {
    global: "globalThis",
    "process.env.NODE_ENV": '"production"',
    __PWA_VERSION__: JSON.stringify((/* @__PURE__ */ new Date()).toISOString()),
    "import.meta.env.VITE_BUILD_ID": JSON.stringify(
      process.env.VITE_BUILD_ID || `build-${Date.now().toString(36)}`
    )
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    exclude: ["@capacitor/core"]
  },
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg", "**/*.mp3", "**/*.wav"]
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvam9zZXBobXVsZS9EZXNrdG9wL20xc3Npb24tZnVsbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2pvc2VwaG11bGUvRGVza3RvcC9tMXNzaW9uLWZ1bGwvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2pvc2VwaG11bGUvRGVza3RvcC9tMXNzaW9uLWZ1bGwvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBleGVjU3luYyB9IGZyb20gJ25vZGU6Y2hpbGRfcHJvY2Vzcydcbi8vIFx1MDBBOSAyMDI1IEpvc2VwaCBNVUxcdTAwQzkgXHUyMDEzIENFTyBkaSBOSVlWT1JBIEtGVFx1MjEyMlxuLy8gTTFTU0lPTlx1MjEyMiBUcmVhc3VyZSBIdW50IEFwcCAtIEN1c3RvbSBWaXRlIENvbmZpZ3VyYXRpb25cbi8vIE9wdGltaXplZCBmb3IgQ2FwYWNpdG9yIGlPUy9BbmRyb2lkIGRlcGxveW1lbnQgd2l0aCBlbmhhbmNlZCBidWlsZCBzZXR0aW5nc1xuXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBjaGVja2VyIGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2Z1bmN0aW9ucy92MSc6ICdodHRwOi8vbG9jYWxob3N0OjU0MzIxJ1xuICAgIH0sXG4gIH0sXG4gIGVzYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgIGxvZ092ZXJyaWRlOiB7ICd0aGlzLWlzLXVuZGVmaW5lZC1pbi1lc20nOiAnc2lsZW50JyB9LFxuICAgIC8vIEluIHByb2R1emlvbmUgTk9OIGRyb3BwaWFtbyBcImNvbnNvbGVcIiBhIGxpdmVsbG8gZXNidWlsZCBwZXIgcHJlc2VydmFyZSBlcnJvci93YXJuLlxuICAgIC8vIExhIHJpbW96aW9uZSBzZWxldHRpdmEgZGkgbG9nL2luZm8vZGVidWcgXHUwMEU4IGdlc3RpdGEgZGEgVGVyc2VyIChwdXJlX2Z1bmNzKSBpbiBidWlsZC5cbiAgICBkcm9wOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyBbJ2RlYnVnZ2VyJ10gOiBbXSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgICBtb2RlID09PSAncHJvZHVjdGlvbicgJiYgdmlzdWFsaXplcih7XG4gICAgICBmaWxlbmFtZTogJ2Rpc3QvYnVuZGxlLWFuYWx5c2lzLmh0bWwnLFxuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBnemlwU2l6ZTogdHJ1ZSxcbiAgICAgIGJyb3RsaVNpemU6IHRydWUsXG4gICAgfSksXG4gIF0uZmlsdGVyKEJvb2xlYW4pIGFzIGFueSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYmFzZTogJy8nLFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICBtaW5pZnk6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/ICd0ZXJzZXInIDogZmFsc2UsXG4gICAgc291cmNlbWFwOiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0uW2hhc2hdLmpzJyxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLltoYXNoXS5qcycsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS5baGFzaF0uW2V4dF0nLFxuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICAncm91dGVyLXZlbmRvcic6IFsncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICd1aS12ZW5kb3InOiBbJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLCAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLCAnQHJhZGl4LXVpL3JlYWN0LXRvYXN0J10sXG4gICAgICAgICAgJ3N1cGFiYXNlLXZlbmRvcic6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgJ2FuaW1hdGlvbi12ZW5kb3InOiBbJ2ZyYW1lci1tb3Rpb24nLCAnbG90dGllLXJlYWN0J10sXG4gICAgICAgICAgJ3RocmVlLXZlbmRvcic6IFsndGhyZWUnLCAnQHJlYWN0LXRocmVlL2RyZWknXSxcbiAgICAgICAgICAnbWFwLXZlbmRvcic6IFsnbGVhZmxldCcsICdyZWFjdC1sZWFmbGV0JywgJ0ByZWFjdC1nb29nbGUtbWFwcy9hcGknXSxcbiAgICAgICAgICAnc3RyaXBlLXZlbmRvcic6IFsnQHN0cmlwZS9zdHJpcGUtanMnLCAnQHN0cmlwZS9yZWFjdC1zdHJpcGUtanMnXVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZXh0ZXJuYWw6IFtdLFxuICAgICAgb253YXJuKHdhcm5pbmcsIHdhcm4pIHtcbiAgICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ1NPVVJDRU1BUF9FUlJPUicpIHJldHVybjtcbiAgICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ01PRFVMRV9MRVZFTF9ESVJFQ1RJVkUnKSByZXR1cm47XG4gICAgICAgIHdhcm4od2FybmluZyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAyMDAwLFxuICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiBmYWxzZSxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IGZhbHNlLCAvLyBLZWVwIGNvbnNvbGUgZm9yIGVycm9yIGRlYnVnZ2luZ1xuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgICBwdXJlX2Z1bmNzOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyBbJ2NvbnNvbGUubG9nJywgJ2NvbnNvbGUuaW5mbycsICdjb25zb2xlLmRlYnVnJ10gOiBbXSxcbiAgICAgIH0sXG4gICAgICBtYW5nbGU6IHtcbiAgICAgICAgc2FmYXJpMTA6IHRydWVcbiAgICAgIH0sXG4gICAgICBmb3JtYXQ6IHtcbiAgICAgICAgY29tbWVudHM6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAncHJvY2Vzcy5lbnYuTk9ERV9FTlYnOiAnXCJwcm9kdWN0aW9uXCInLFxuICAgIF9fUFdBX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKS50b0lTT1N0cmluZygpKSxcbiAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfQlVJTERfSUQnOiBKU09OLnN0cmluZ2lmeShcbiAgICAgIHByb2Nlc3MuZW52LlZJVEVfQlVJTERfSUQgfHwgYGJ1aWxkLSR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9YFxuICAgICksXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICBleGNsdWRlOiBbJ0BjYXBhY2l0b3IvY29yZSddLFxuICB9LFxuICBhc3NldHNJbmNsdWRlOiBbJyoqLyoucG5nJywgJyoqLyouanBnJywgJyoqLyouanBlZycsICcqKi8qLmdpZicsICcqKi8qLnN2ZycsICcqKi8qLm1wMycsICcqKi8qLndhdiddXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUtBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUVsQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGtCQUFrQjtBQUMzQixPQUFPLFVBQVU7QUFWakIsSUFBTSxtQ0FBbUM7QUFhekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxpQkFBaUI7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLGFBQWEsRUFBRSw0QkFBNEIsU0FBUztBQUFBO0FBQUE7QUFBQSxJQUdwRCxNQUFNLFNBQVMsZUFBZSxDQUFDLFVBQVUsSUFBSSxDQUFDO0FBQUEsRUFDaEQ7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLElBQzFDLFNBQVMsZ0JBQWdCLFdBQVc7QUFB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
