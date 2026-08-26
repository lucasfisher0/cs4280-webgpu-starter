// Hello Triangle — adapter → device → context → render pipeline → your
// first WGSL shaders. Every object created below traces back to one of
// the seven steps: request device → configure canvas → vertex buffer →
// shader module → render pipeline → render pass → submit. Read alongside
// hello-canvas2d.js — same setup → resize → render-loop shape, this one
// with a WebGPU device/pipeline layer underneath it.

import { createBuffer } from "@/lib/webgpu/buffers.js";
import { configureContext, getPreferredCanvasFormat } from "@/lib/webgpu/context.js";
import { createShaderModule } from "@/lib/webgpu/shaders.js";
import shaderCode from "./hello-triangle.wgsl?raw";

const canvas = document.getElementById("canvasWebgpu");
const statusEl = document.getElementById("statusWebgpu");

// Interleaved [x, y, r, g, b] per vertex, positions already in clip space.
// prettier-ignore
const VERTEX_DATA = new Float32Array([
  0.0, 0.6, 1.0, 0.35, 0.35, -0.6, -0.6, 0.35, 1.0, 0.35, 0.6, -0.6, 0.35, 0.35, 1.0,
]);
const FLOATS_PER_VERTEX = 5;

function showStatus(message) {
  statusEl.hidden = false;
  statusEl.textContent = message;
}

async function main() {
  if (!navigator.gpu) {
    showStatus("WebGPU is not supported in this browser. Try Chrome or Edge 113+.");
    return;
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    showStatus("No WebGPU adapter was found.");
    return;
  }
  const device = await adapter.requestDevice();
  const format = getPreferredCanvasFormat();
  const context = configureContext(canvas, device, format);

  const vertexBuffer = createBuffer(
    device,
    VERTEX_DATA,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    "hello-triangle-vertices",
  );
  const shaderModule = createShaderModule(device, shaderCode, "hello-triangle");

  // Compiled once, never inside the render loop — pipeline creation is
  // exactly when the browser compiles and validates the shaders.
  const pipeline = device.createRenderPipeline({
    label: "hello-triangle-pipeline",
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: FLOATS_PER_VERTEX * 4,
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x2" }, // position
            { shaderLocation: 1, offset: 2 * 4, format: "float32x3" }, // color
          ],
        },
      ],
    },
    fragment: { module: shaderModule, entryPoint: "fragmentMain", targets: [{ format }] },
    primitive: { topology: "triangle-list" },
  });

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  function frame() {
    const encoder = device.createCommandEncoder({ label: "hello-triangle-encoder" });
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.06, g: 0.06, b: 0.09, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
