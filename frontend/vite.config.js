import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  appType: "spa",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080", // gateway
        changeOrigin: true,
      },
    },
  },
});
