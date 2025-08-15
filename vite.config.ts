import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // anything starting with /fpl -> https://fantasy.premierleague.com/api
      "/fpl": {
        target: "https://fantasy.premierleague.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/fpl/, "/api"),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
