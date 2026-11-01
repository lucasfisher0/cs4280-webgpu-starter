import {defineConfig, mergeConfig} from "vitest/config";
// @ts-ignore
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      root: import.meta.dirname,
      environment: "jsdom",
      setupFiles: ["./vitest.setup.js"],
      include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
      exclude: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**"
      ]
    }
  })
);
