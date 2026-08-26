import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://10.1.150.142:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://10.1.150.142:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      
      registerType: "autoUpdate",
      manifest: {
        name: "LT - KCIRI Application",
        short_name: "LT - KCIRI",
        description: "LT - KCIRI Application",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/images/lt-logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/kciri_logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
