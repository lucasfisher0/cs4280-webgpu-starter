import {fileURLToPath, URL} from "node:url";
import {defineConfig} from "vite";
import path from 'path';

// A plain multi-page site: every activity/assignment gets its own HTML page
// (own <script type="module" src="./main.js">), not a single-page app with
// client-side routing. Vite's dev server serves any of these paths
// directly with no extra config; for `vite build`, every page needs to be
// listed as a build input below or it won't end up in dist/. Paths are
// relative to src/ (this project's Vite `root`). activities/ and
// assignments/ are currently just placeholder folders (see their
// README.md) — add an entry here (e.g. "activities/week03-transforms/
// index.html") for each one as it gets built.
const pages = [
  "index.html",
  "assignments/a1-image-compression/index.html",
  "assignments/a2-transforms-camera/index.html",
  "activities/sample-triangle/index.html",
  "activities/sierpinski-gasket/index.html",
];

// https://vite.dev/config/
export default defineConfig({
  root: "src",
  publicDir: "../public",
  plugins: [],
  resolve: {
    alias: {
      // "@" here refers to the root folder
      // "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@": path.resolve(import.meta.dirname, './src'),
    }
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [
          page.replace(/\/index\.html$/, "").replace(/\.html$/, ""),
          fileURLToPath(new URL(`./src/${page}`, import.meta.url)),
        ]),
      ),
    }
  }
});
