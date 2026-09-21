//import {configureContext, getPreferredCanvasFormat} from "../../lib/webgpu/context";
import {createShaderModule} from "@/lib/webgpu/shaders";
import shaderCode from "./shaders.wgsl?raw";
import {configureContext} from "@/lib/webgpu/context";


async function main() {
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return;
  }

  const canvas = new HTMLCanvasElement();
  const device: GPUDevice = await adapter.requestDevice();
  const format = navigator.gpu.getPreferredCanvasFormat();
  const context = configureContext(canvas, device, format);
  context.configure({device, format, alphaMode: "opaque"})


  const VERTEX_DATA: Float32Array = new Float32Array([
    // x, y, r, g, b
    0.0, 0.0, 0.0, 0.0, 0.0
  ]);
  const vertexBuffer = device.createBuffer({
    label: "triangle-vertices",
    size: VERTEX_DATA.byteLength,
    usage: 0 // GPUBufferUsage.VERTEX | GPUBufferUSage.COPY_DST
  })
  device.queue.writeBuffer(vertexBuffer, 0, VERTEX_DATA);

  const shaderModule = createShaderModule(device, shaderCode, "cube");

  const pipeline = device.createRenderPipeline({
    label: "the-pipeline",
    "layout": "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: 5 * 4, // Float32 per vertex * bytes per float32
          attributes: [
            {shaderLocation: 0, offset: 0, format: "float32x2"},
            {shaderLocation: 1, offset: 2 * 4, format: "float32x2"}
          ]
        }
      ]

    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [{format: format}]
    },
    primitive: {topology: "triangle-list"}
  });

  const commandEncoder = device.createCommandEncoder({
    label: "frame-encoder",
  });
  const passEncoder = commandEncoder.beginRenderPass({
    label: "render-encoder",
    colorAttachments: [{
      view: context.getCurrentTexture(),
      clearValue: {r: 0.0, g: 0.0, b: 0.0, a: 1.0},
      loadOp: "clear",
      storeOp: "store"
    }]
  });
  passEncoder.setPipeline(pipeline);
  passEncoder.setVertexBuffer(0, vertexBuffer);
  passEncoder.draw(3);
  passEncoder.end();

  /*
  clearValue?: GPUColor
  depthSlice?: GPUIntegerCoordinate
  loadOp: GPULoadOp
  resolveTarget?: GPUTexture | GPUTextureView
  storeOp: GPUStoreOp
  view: GPUTexture | GPUTextureView
}
*/


  if (!commandEncoder || !pipeline)
    return;

}

main();
