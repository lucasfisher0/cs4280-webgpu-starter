
### Example project structure (AI):
```
src/
├── core/
│   ├── WebGPUContext.ts    # Adapter, device, canvas config
│   ├── Renderer.ts         # Main rAF loop & command encoder
│   └── ShaderLoader.ts     # WGSL imports / string management
├── resources/
│   ├── BufferManager.ts    # Vertex/Index/Uniform helpers
│   └── TextureManager.ts   # Image-to-GPUTexture helper
├── scene/
│   ├── Camera.ts           # Projection & view matrices
│   ├── Mesh.ts             # Geometry + Material + Transform
│   └── Material.ts         # Bind groups & pipeline bindings
└── main.ts                 # Entry point & scene setup
```

Good project for reference: https://github.com/isaac-mason/gpucat



# Decisions to make:
- Should tick be every frame or customizable?
- How far do I want to go in generating shaders?
  - Is it possible to support a compiler/permutations via TypeScript without using a full library?
- How far do I want to go in creating new structures to handle operations?
- Assignment 4 introduces the scenegraph, how much do I want to implement before this?

# Structure
- .

# TODO:
- GPUCat uses d namespace to import WGSL types into TypeScript--
