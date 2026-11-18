import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxy = {
  "/api": {
    target: "http://localhost:8081",
    changeOrigin: true,
  },
  "/uploads": {
    target: "http://localhost:8081",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5500,
    strictPort: true,
    proxy,
  },
  preview: {
    port: 5500,
    strictPort: true,
    proxy,
  },
});
