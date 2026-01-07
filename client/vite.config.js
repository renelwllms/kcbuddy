import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"],
      modernPolyfills: true
    })
  ],
  server: {
    port: 5173,
    host: true,
    origin: "http://192.168.1.233:5173",
    hmr: {
      host: "192.168.1.233",
      clientPort: 5173
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "dist"
  }
});
