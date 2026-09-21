import shaderCode from "./shaders.wgsl?raw";
//import type {GPUBufferUsage, GPUShaderStage} from '@webgpu/types';

const scaleSlider = document.getElementById("scaleSlider") as HTMLInputElement;
const speedSlider = document.getElementById("speedSlider") as HTMLInputElement;

let currTime: number | null = null;
function getDeltaTime(): number {
  const oldTime = currTime;
  currTime = performance.now();
  return !oldTime ? 0.0 : (currTime - oldTime) * 0.001;
}
async function initWebGPU() {
  if (!navigator.gpu) {
    console.log("WebGPU is not supported.");
    return;
  }

  const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" })
  if (!adapter) {
    console.log("No suitable gpu found.");
    return;
  }

  const device: GPUDevice = await adapter.requestDevice();
  const canvas: HTMLCanvasElement | null = document.getElementById("myCanvas") as HTMLCanvasElement | null;
  if (!canvas) {
    console.log("Failed to retrieve Canvas element.")
    return;
  }
  const context: GPUCanvasContext = canvas.getContext("webgpu")! as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device, format, alphaMode: "opaque"
  })

  const VERTEX_DATA = new Float32Array([
    // x, y, r, g, b
    0.0, 0.5, 1.0, 0.2, 0.2,
    -0.5, -0.5, 0.2, 1.0, 0.2,
    0.5, -0.5, 0.2, 0.2, 1.0,
  ])

  const vertexBuffer = device.createBuffer({
    label: "triangle-vertices",
    size: VERTEX_DATA.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })

  device.queue.writeBuffer(vertexBuffer, 0, VERTEX_DATA)

  const UNIFORM_SIZE: number = 4 * 4;
  let uniformBuffer: GPUBuffer = device.createBuffer({
    label: "transform-uniform",
    size: UNIFORM_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroupLayout: GPUBindGroupLayout = device.createBindGroupLayout({
    label: "u-layout",
    entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {type: "uniform"}
      }]
  });

  const bindGroup: GPUBindGroup = device.createBindGroup({
    label: "u-group",
    layout: bindGroupLayout,
    entries: [{
      binding: 0,
      resource: {buffer: uniformBuffer}
    }]
  });

  const shaderModule = device.createShaderModule({label: "triangle-shader", code: shaderCode})

  const pipeline = device.createRenderPipeline({
    label: "the-pipeline",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    vertex: {
      module: shaderModule,
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: 5 * 4,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x2' },
            { shaderLocation: 1, offset: 2 * 4, format: 'float32x2' },
          ]
        }
      ]
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [{ format: format }]
    },
    primitive: { topology: 'triangle-list' }
  })

  let angle: number = 0.0;
  function renderFrame() {
    const deltaTime = getDeltaTime();
    const scale = scaleSlider.valueAsNumber;
    const speed = scaleSlider.valueAsNumber;
    angle += speed * deltaTime;

    const c = Math.cos(angle) * scale;
    const s = Math.sin(angle) * scale;
    const uniformData = new Float32Array([c, s, -s, c]);

    device.queue.writeBuffer(uniformBuffer, 0, uniformData);
    const commandEncoder = device.createCommandEncoder({
      label: 'frame-encoder',
    })

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0.05, g: 0.05, b: 0.05, a: 1.0 },
        loadOp: "clear",
        storeOp: "store"
      }]
    })

    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0, vertexBuffer)
    passEncoder.draw(3)
    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(renderFrame);
  }
  requestAnimationFrame(renderFrame);
}

initWebGPU();
