import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function prerenderPlugin() {
  return {
    name: "kcbuddy-prerender",
    apply: "build",
    async closeBundle() {
      const moduleUrl = pathToFileURL(path.join(__dirname, "prerender.js")).href;
      const { run } = await import(moduleUrl);
      await run();
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"],
      modernPolyfills: true
    }),
    prerenderPlugin()
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
