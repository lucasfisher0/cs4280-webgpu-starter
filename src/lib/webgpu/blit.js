import { createShaderModule } from "./shaders.js";

// A full-screen triangle (covers clip space with 3 vertices, no vertex
// buffer needed) sampling an RGBA8 texture — the standard way to display a
// CPU-computed image (e.g. a ray-traced frame) through WebGPU.
const BLIT_SHADER = `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0),
  );
  let p = positions[vertexIndex];
  var out: VertexOutput;
  out.position = vec4<f32>(p, 0.0, 1.0);
  out.uv = vec2<f32>((p.x + 1.0) * 0.5, 1.0 - (p.y + 1.0) * 0.5);
  return out;
}

@group(0) @binding(0) var blitSampler: sampler;
@group(0) @binding(1) var blitTexture: texture_2d<f32>;

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
  return textureSample(blitTexture, blitSampler, in.uv);
}
`;

/**
 * Presents a CPU-computed RGBA8 pixel buffer through WebGPU as a
 * full-screen quad. Intended for the ray tracer assignment (or anything
 * else computing pixels off the GPU): call `setSize` when the target
 * resolution changes, `writePixels` with a freshly computed frame, and
 * `frame(context)` every animation frame to draw the latest pixels.
 *
 * @param {GPUDevice} device
 * @param {GPUTextureFormat} format
 */
export function createPixelBlitter(device, format) {
  const shaderModule = createShaderModule(device, BLIT_SHADER, "pixel-blitter");
  const sampler = device.createSampler({ magFilter: "nearest", minFilter: "nearest" });
  const pipeline = device.createRenderPipeline({
    label: "pixel-blitter-pipeline",
    layout: "auto",
    vertex: { module: shaderModule, entryPoint: "vertexMain" },
    fragment: { module: shaderModule, entryPoint: "fragmentMain", targets: [{ format }] },
    primitive: { topology: "triangle-list" },
  });

  let texture = null;
  let bindGroup = null;
  let width = 0;
  let height = 0;

  function setSize(nextWidth, nextHeight) {
    width = Math.max(1, Math.floor(nextWidth));
    height = Math.max(1, Math.floor(nextHeight));
    texture?.destroy();
    texture = device.createTexture({
      label: "pixel-blitter-texture",
      size: { width, height },
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: texture.createView() },
      ],
    });
  }

  return {
    setSize,
    /** @param {Uint8ClampedArray | Uint8Array} rgba tightly-packed RGBA8, `width * height * 4` bytes */
    writePixels(rgba) {
      if (!texture) return;
      device.queue.writeTexture(
        { texture },
        rgba,
        { bytesPerRow: width * 4, rowsPerImage: height },
        { width, height },
      );
    },
    frame(context) {
      if (!bindGroup) return;
      const encoder = device.createCommandEncoder({ label: "pixel-blitter-encoder" });
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    destroy() {
      texture?.destroy();
    },
  };
}
