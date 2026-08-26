# CS 4280 — Computer Graphics (WebGPU Starter)

A starter repository for CS 4280, built on plain JavaScript, WGSL, and
Vite — no framework. It provides the infrastructure — device setup, the
render loop, buffer/shader/texture helpers, and a small math library —
and leaves every graphics algorithm (transforms, lighting, texturing,
curves, ray tracing, PBR, ...) for you to implement.

Start with the home page (`npm run dev`, then open the printed URL) —
**Hello Canvas2D** and **Hello Triangle** run right there, side by side.
Every later activity and assignment follows the exact same shape one of
those two already shows in full — a persistent scene, resize handling, a
render loop — just with (or without) a WebGPU device/pipeline layer
underneath.

`src/activities/` and `src/assignments/` are currently empty placeholders
(each holds only a `.keep` file) — pages get built into them as the
course progresses.

## Requirements

- Node.js `>= 20.19`
- A WebGPU-capable browser for actually running the app: Chrome or Edge
  113+.

## Getting started

```sh
npm install
npm run dev
```

Then open the printed local URL — the home page runs the two worked
examples directly.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Production build to `dist/` (every page listed in `vite.config.js`'s `pages` array). |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Check formatting/lint rules with Biome. |
| `npm run lint:fix` | Same, applying safe fixes. |
| `npm run ci` | `lint` + `test` + `build`, what CI runs. |

## Project structure

```
vite.config.js                 # lists every page for `npm run build`; sets `root: "src"`
biome.json                       # lint/format config

src/
├── index.html              # home page — Hello Canvas2D + Hello Triangle, running side by side
├── hello-canvas2d.js         # the Canvas2D example's full source
├── hello-triangle.js          # the WebGPU example's full source
├── hello-triangle.wgsl         # its WGSL shaders
├── style.css                    # shared dark-theme styling for the home page
├── lib/
│   ├── math/                # vec2/vec3/vec4/mat4 (implemented) + transforms/curves (TODO stubs)
│   ├── webgpu/               # context/buffer/shader/texture/geometry/blit helpers (implemented)
│   ├── scenegraph/            # SceneNode — construction is given; traversal is a TODO stub
│   └── image/                  # loadImage/sampleImage/storage (implemented) + palette/quantize/blockAverage (TODO stubs)
├── activities/     # placeholder — one .keep file, nothing else yet
└── assignments/    # placeholder — one .keep file, nothing else yet
```

Everything Vite serves/bundles lives under `src/`; `vite.config.js`,
`package.json`, `biome.json`, and the rest of the tooling config stay at
the project root, outside it. The `@` import alias points at `src/`, so
`@/lib/webgpu/context.js` resolves to `src/lib/webgpu/context.js`.

When an activity or assignment page does get built, it follows the same
shape throughout this repo: `index.html` + `main.js` (+ `shaders.wgsl`
where it uses WebGPU) — that's the whole page, one file to read top to
bottom. Controls (sliders, buttons, selects) are plain HTML elements in
`index.html`, wired up with `addEventListener` in `main.js` — no
control-factory library, no virtual DOM, no router. `src/hello-canvas2d.js`
and `src/hello-triangle.js` are worked examples of exactly this shape.

## What's implemented vs. what's yours to build

- **`src/lib/webgpu/`, `src/lib/image/{loadImage,sampleImage,storage}.js`**
  — working infrastructure, not graded content.
- **`src/lib/math/transforms.js`, `src/lib/math/curves.js`,
  `src/lib/image/{palette,quantize,blockAverage}.js`** — every function
  throws `"not implemented"`. These *are* Assignment 1, 2, and 5's actual
  deliverables; implementing them is most of what those three assignments
  ask for.
- **`src/lib/scenegraph/SceneNode.js`** — construction/bookkeeping
  (`addChild`, `setLocalTransform`, `find`) is given; `updateWorldTransforms()`
  and `traverse()` throw — they're Assignment 4's "parent-child transform
  inheritance, recursively traversed" deliverable. Assignment 7 reuses
  the same file, so implementing it once for Assignment 4 covers both.
- **`src/hello-canvas2d.js`, `src/hello-triangle.js`** — fully worked,
  always. Not graded; read them.

## Adding a new activity or assignment

There's no router and no shared page-registry file:

1. Create the folder under `src/activities/` or `src/assignments/` and
   give it `index.html` + `main.js` (+ `shaders.wgsl` if it uses WebGPU)
   — see `src/hello-triangle.js`/`src/hello-triangle.wgsl` and
   `src/hello-canvas2d.js` for the shape to follow, and `src/lib/` for
   what infrastructure is already available to import.
2. Add the new page's path to the `pages` array in `vite.config.js` (a
   path relative to `src/`, e.g. `"activities/week03-transforms/
   index.html"`), so `npm run build` includes it.

## License

MIT — see `LICENSE`.
