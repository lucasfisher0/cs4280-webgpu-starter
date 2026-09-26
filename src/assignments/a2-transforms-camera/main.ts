import {createShaderModule} from "@/lib/webgpu/shaders";
// @ts-ignore
import shaderCode from "./shaders.wgsl?raw";
import {CUBE_VERTICES, AXIS_VERTICES} from "./cube";
import {Camera} from "./camera";
import {configureContext} from "@/lib/webgpu/context";
import GUI from "lil-gui";
import {Entity} from "@/assignments/a2-transforms-camera/entity";
import {identity, invert, multiply, multiplyAll} from "@/lib/math/mat4";
import {lookAt, perspective, scale as matrixScale, shear} from "@/lib/math/transforms";

//#region GUI
const gui = new GUI( { container: document.getElementById( 'controlBox' )! } );
const params = {
  cameraDistance: 5,
  cameraSpin: true,
  scale: 1.0,
  shearX: 0,
  shearY: 0,
  shearZ: 0
};
gui.add(params, 'cameraDistance', 2, 12, 0.1);
gui.add(params, 'scale', 0.3, 2, 0.05);
gui.add(params, 'shearX', -1, 1, 0.05);
gui.add(params, 'shearY', -1, 1, 0.05);
gui.add(params, 'shearZ', -1, 1, 0.05);
gui.add(params, 'cameraSpin');
//#endregion

//#region Delta Time
let currTime: number | null = null;
function getDeltaTime(): number {
  const oldTime = currTime;
  currTime = performance.now();
  return !oldTime ? 0.0 : (currTime - oldTime) * 0.001;
}
//#endregion

const camera = new Camera();
const cube = new Entity();

async function InitWebGPU() {
//#region Initialization
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return;
  }
  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;//new HTMLCanvasElement();
  const device: GPUDevice = await adapter.requestDevice();
  const format = navigator.gpu.getPreferredCanvasFormat();
  const context = configureContext(canvas, device, format);
  context.configure({device, format, alphaMode: "opaque"})
//#endregion

//#region Uniform
  const UNIFORM_SIZE: number = 16 * 4; // one mat4x4<f32>: mvp
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
//#endregion

//#region CUBE
  const vertexBuffer = device.createBuffer({
    label: "triangle-vertices",
    size: CUBE_VERTICES.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(vertexBuffer, 0, CUBE_VERTICES);

  const shaderModule = createShaderModule(device, shaderCode, "cube");

  const pipeline = device.createRenderPipeline({
    label: "the-pipeline",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: 6 * 4, // Float32 per vertex * bytes per float32
          attributes: [
            {shaderLocation: 0, offset: 0, format: "float32x2"},
            {shaderLocation: 1, offset: 3 * 4, format: "float32x2"}
          ]
        }
      ]
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [{format: format}]
    },
    primitive: {topology: "triangle-list"},
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth32float'
    }
  });
//#endregion

  let depthTexture: GPUTexture | null = null;

//#region Frame
  function renderFrame() {
    const deltaTime = getDeltaTime();
    camera.tetherDistance = params.cameraDistance;
    camera.spinSpeed = Number(params.cameraSpin) * 0.2;
    camera.tick(deltaTime);

    // Model
    cube.scale = matrixScale(params.scale, params.scale, params.scale);
    let modelMatrix = cube.getTransformMatrix();
    modelMatrix = multiply(modelMatrix, shear(params.shearX, 0, params.shearY, 0, params.shearZ, 0));

    // View
    const fov = 1.0472; // 60 deg, vertical FoV
    const a = canvas.clientWidth/canvas.clientHeight;

    const viewMatrix = lookAt(
      camera.getPosition(),
      new Float32Array([0, 0, 0]),
      new Float32Array([0, 0, 1]),
    );

    // Projection
    const projectionMatrix = perspective(camera.verticalFov, a, camera.clipNear, camera.clipFar);
    const mvp = multiplyAll([modelMatrix, viewMatrix, projectionMatrix]);

    const canvasTexture = context.getCurrentTexture();
    if (depthTexture && (depthTexture.width !== canvasTexture.width || depthTexture.height !== canvasTexture.height))
      depthTexture.destroy();
    if (!depthTexture) {
      depthTexture = device.createTexture({
        size: [canvasTexture.width, canvasTexture.height],
        format: "depth32float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      });
    }

    const commandEncoder = device.createCommandEncoder({
      label: 'frame-encoder',
    })

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: canvasTexture.createView(),
        clearValue: { r: 0.05, g: 0.05, b: 0.05, a: 1.0 },
        loadOp: "clear",
        storeOp: "store"
      }],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    })

    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    device.queue.writeBuffer(uniformBuffer, 0, mvp);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(36); // 6 faces x 2 triangles x 3 vertices

    // TODO GIZMO PASS
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(renderFrame);
    // console.log(`Camera Position: ${camera.getPosition()}`);
  }
//#endregion
  requestAnimationFrame(renderFrame);
}

InitWebGPU();
//window.addEventListener("DOMContentLoaded", InitWebGPU);
