import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        client: "./client.js",
      },
    },
  },
  resolve: {
    alias: {
      "react-router": "react-router",
    },
  },
}); 