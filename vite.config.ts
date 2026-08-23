import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Vite loads env from the frontend package dir only (frontend/.env). Only public VITE_*
// client values belong in the browser bundle.
const frontendRoot = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  envDir: frontendRoot,
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
  },
});
