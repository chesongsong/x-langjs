import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";

// GitHub Pages 部署时通过环境变量设置 base，例如 /repo-name/
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [vue(), react({ include: /\.(tsx)$/ })],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    preserveSymlinks: false,
  },
});
