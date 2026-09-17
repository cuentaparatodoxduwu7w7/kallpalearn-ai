import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Detectar el nombre del repositorio desde la variable de entorno o usar '/'
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const base = repoName ? `/${repoName}/` : '/';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
