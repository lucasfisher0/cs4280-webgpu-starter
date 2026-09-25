import shaderCode from "./shaders.wgsl?raw";
import GUI from "lil-gui";

type Point = [x: number, y: number];

const gui = new GUI({ container: document.getElementById( "controlContainer" )! });
const params = {
  count: 1000,
  color: '#fd0303',
  bgColor: '#131313'
};

const INITIAL_TRIANGLE: Point[] = [
  [-1, 1],
  [0, 1],
  [1, 1]
];
let VERTEX_DATA: Float32Array | null = null;
let vertexBuffer: GPUBuffer | null = null;

gui.add( params, "count", 100, 10000, 100).onChange( async (n: number)=>{
  if (vertexBuffer != null)
    (vertexBuffer as GPUBuffer).destroy();

  const points: number[] = [...sierpinksi(n)].flat(2);
  VERTEX_DATA = new Float32Array(points);
});

function sierpinksi(n: number, triangle: Point[] = INITIAL_TRIANGLE): Point[] {
  const points: Point[] = [];

  let position: Point = [0, 0];
  for (let i = 0; i < n; i++) {
    const c = Math.floor(Math.random() * 3);
    position[0] = (position[0] + triangle[c]![0])/2;
    position[1] = (position[1] + triangle[c]![1])/2;
    points.push(position);
  }

  return points;
}

async function initWebGPU() {
//#region Initialization
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
  });

//#endregion

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
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: 2 * 4,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x2' },
          ]
        }
      ]
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [{ format: format }]
    },
    primitive: { topology: 'point-list' }
  })

  function renderFrame() {
    if (VERTEX_DATA == null) {
      const points: number[] = [...sierpinksi(params.count)].flat();
      VERTEX_DATA = new Float32Array(points);
    }

    if (vertexBuffer == null) {
      vertexBuffer = device.createBuffer({
        label: "triangle-vertices",
        size: VERTEX_DATA.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
      });
    }
    device.queue.writeBuffer(vertexBuffer, 0, VERTEX_DATA);

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

    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(VERTEX_DATA.length / 2);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(renderFrame);
  }
  requestAnimationFrame(renderFrame);
}

initWebGPU();
