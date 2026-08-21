import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
<<<<<<< HEAD
      
      registerType: "autoUpdate",
      manifest: {
        name: "LT - KCIRI Application",
        short_name: "LT - KCIRI",
        description: "LT - KCIRI Application",
=======
      registerType: "autoUpdate",
      manifest: {
        name: "My React App",
        short_name: "MyApp",
        description: "My React Progressive Web App",
>>>>>>> MS-ltfe-report
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
<<<<<<< HEAD
  
=======
>>>>>>> MS-ltfe-report
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
