import {defineConfig, mergeConfig} from "vitest/config";
import path from "path";
// @ts-ignore
import viteConfig from "./vite.config.ts";

let defines = viteConfig.define;
//defines["__ENABLE_SCENE_EDITOR__"] = false;

export default defineConfig({
  root: "src",
  publicDir: "public",
  define: defines ?? {},
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(import.meta.dirname, './src'),
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
  },
});
