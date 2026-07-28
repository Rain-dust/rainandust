import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://rain-dust-portfolio.workspace-852244.chatgpt.site",
  output: "static",
  outDir: "./dist/client",
  vite: {
    cacheDir: "./.vite-cache",
  },
  build: {
    assets: "assets",
  },
});
