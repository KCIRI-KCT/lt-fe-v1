import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawApiUrl = env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  let targetHost = 'http://127.0.0.1:8000';
  try {
    if (rawApiUrl.startsWith('http')) {
      targetHost = new URL(rawApiUrl).origin;
    }
  } catch {
    targetHost = rawApiUrl;
  }
  const wsHost = targetHost.replace(/^http/, 'ws');

  return {
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: targetHost,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: wsHost,
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
          name: "Siteaense - KCIRI Application",
          short_name: "Siteaense",
          description: "Siteaense Application",
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
};
});

