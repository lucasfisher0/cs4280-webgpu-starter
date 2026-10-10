import {createShaderModule} from "@/lib/webgpu/shaders";
import shaderCode from "./shaders.wgsl?raw";
import {Camera} from "@/core/render/Camera";
import {type RenderTick, renderTickEvent} from "@/core/render/Render"
import {GUI, Controller} from "lil-gui";
import {Entity} from "@/assignments/a2-transforms-camera/entity";
import * as Mat4 from "@/lib/math/mat4";
import {
  fromEulerZYX,
  ortho,
  perspective,
  scale as matrixScale,
  shear,
  translate as matrixTranslate
} from "@/lib/math/transforms";

import {Renderer} from "@/core/render/Render";
import {Material, DEFAULT_MATERIAL} from "@/core/render/Material";
DEFAULT_MATERIAL.shader = ["DEFAULT", shaderCode];

import {
  generateGasket,
} from "@/assignments/a3-sierpinski-gasket/tetrahedron";
import {Model} from "@/core/render/Model";
import {configureContext} from "@/lib/webgpu/context";

type PointerMovement = [x: number, y: number];
type vec3 = [number, number, number];

function deg2rad(deg: number) {
  return deg * Math.PI / 180;
}

let currTime: number | null = null;
function getDeltaTime(): number {
  const oldTime = currTime;
  currTime = performance.now();
  return !oldTime ? 0.0 : (currTime - oldTime) * 0.001;
}

//#region GUI
const gui = new GUI( { container: document.getElementById( 'controlBox' )! } );
const params = {
  cameraDistance: 5,
  cameraSpin: true,
  depth: 1,
  diffuse: {r: 1, g: 0, b: 1},
  lightPosition: {x: 5, y: 5, z: 5},
  lightStrength: 1,
  ambientStrength: 0.2,
  specularCoefficient: 10,
  exponent: 1000,
};

const folderModel = gui.addFolder("Model");
const diffuseControl = folderModel.addColor(params, "diffuse").name("Diffuse Color");
const depthControl = folderModel.add(params, "depth", 0, 5, 1).name("Recursion Depth").onChange(() => onDepthUpdated());
const specularControl = folderModel.add(params, "specularCoefficient").name("Specular Coefficient");
const exponentControl = folderModel.add(params, "exponent").name("Exponent");

const folderCamera = gui.addFolder("Camera");
const distanceControl = folderCamera.add(params, "cameraDistance", 2, 12, 0.1).name("Distance");
folderCamera.add(params, "cameraSpin").name("Spin");

const folderLight = gui.addFolder( "Light Position" );
for (const key in params.lightPosition) {
  const elem = folderLight.add(params.lightPosition, key as keyof typeof params.lightPosition, -5, 5)
    .name(key.toUpperCase())
    .domElement!.parentElement!;

  elem.classList.add("inline-gui-property");
  elem.style = "width: 33.33%;";
}
const lightStrengthControl = gui.add(params, "lightStrength").name("Light Strength");
const AmbientStrengthControl = gui.add(params, "ambientStrength", 0.0, 1, 0.05).name("Ambient Strength");
//#endregion

const camera = new Camera();

let tetrahedronModel: Float32Array = new Float32Array([]);
function onDepthUpdated(): Float32Array {
  tetrahedronModel = new Float32Array(generateGasket(params.depth).flat());
  return tetrahedronModel;
}
onDepthUpdated();

async function InitWebGPU() {
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return; // TODO: error popup
  }

  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  let format = navigator.gpu.getPreferredCanvasFormat();
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  let pointer_pos: number[] | null = null;
  let pointer_last: number[] | null = null;
  let dragging = false;

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointer_pos = [e.clientX, e.clientY];
    dragging = true;
    console.log("Dragging Started")
  });
  canvas.addEventListener("pointermove", (e) => {
    pointer_pos = [e.clientX, e.clientY];
  });
  canvas.addEventListener("pointerup", () => {
    dragging = false;
    pointer_last = null;
  });
  canvas.addEventListener("pointercancel", () => {
    dragging = false;
    pointer_last = null;
  });


  let device = await adapter.requestDevice();
  let context = configureContext(canvas, device, format);

  const VERTEX_BATCH_SIZE = 128;
  let vertexBuffer = device.createBuffer({
    label: "models-vertex-buffer",
    size: VERTEX_BATCH_SIZE * 6 * 4, // 128 vertex buffer
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });


//#region UNIFORM
    const UNIFORM_SIZE: number = 76 * 4;
    device.pushErrorScope('validation');
    let uniformBuffer: GPUBuffer = device.createBuffer({
      label: "uniform",
      size: UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.popErrorScope().then(e => e && console.error('uniform buffer error:', e.message));

    const bindGroupLayout: GPUBindGroupLayout = device.createBindGroupLayout({
      label: "u-layout",
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {type: "uniform"}
      }]
    });

    device.pushErrorScope('validation');
    const bindGroup: GPUBindGroup = device.createBindGroup({
      label: "u-group",
      layout: bindGroupLayout,
      entries: [{
        binding: 0,
        resource: {buffer: uniformBuffer}
      }]
    });
    device.popErrorScope().then(e => e && console.error('bindgroup error:', e.message));
//endregion

//#region CUBE
  device.pushErrorScope('validation');
  const shaderModule = createShaderModule(device, shaderCode, "shaders");
  device.popErrorScope().then(e => e && console.error('shader module error:', e.message));

  device.pushErrorScope('validation');
  const pipeline = device.createRenderPipeline({
    label: "cube-pipeline",
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
            {shaderLocation: 0, offset: 0, format: "float32x3"},
            {shaderLocation: 1, offset: 3 * 4, format: "float32x3"}
          ]
        }
      ]
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [{format: format}]
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus'
    }
  });
  device.popErrorScope().then(e => e && console.error('cube pipeline error:', e.message));
//#endregion

  addEventListener("tick", (e: Event) => {
    const tickEvent = e as CustomEvent<RenderTick>;
    tick(tickEvent.detail);
  })

  let depthTexture: GPUTexture | null = null;
  function renderFrame() {
    // Tick
    const deltaTime = getDeltaTime();
    let drag_movement = [0.0, 0.0];
    let tickData: RenderTick = {deltaTime: deltaTime, drag_movement: [0.0, 0.0]};
    if (dragging && pointer_pos)
    {
      if (pointer_last)
      {
        tickData.drag_movement = [
          pointer_pos[0]! - pointer_last[0]!,
          pointer_pos[1]! - pointer_last[1]!];
      }
      pointer_last = pointer_pos;
    }
    tick(tickData);

    // Depth Texture
    const canvasTexture = context.getCurrentTexture();
    if (depthTexture && (depthTexture.width !== canvasTexture.width || depthTexture.height !== canvasTexture.height))
      depthTexture.destroy();
    if (!depthTexture) {
      device.pushErrorScope('validation');
      depthTexture = device.createTexture({
        size: [canvasTexture.width, canvasTexture.height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      });
      device.popErrorScope().then(e => e && console.error('depth texture error:', e.message));
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

    // Uniform
    const modelMatrix = Mat4.identity();
    device.queue.writeBuffer(uniformBuffer, 0, Mat4.transpose(modelMatrix));

    const viewMatrix = camera.getViewMatrix();
    device.queue.writeBuffer(uniformBuffer, 64, Mat4.transpose(viewMatrix));

    // Uniform - Projection Matrix
    const a = canvas.clientWidth/canvas.clientHeight;
    const projectionMatrix = perspective(camera.verticalFov, a, camera.clipNear, camera.clipFar);
    device.queue.writeBuffer(uniformBuffer, 128, Mat4.transpose(projectionMatrix));

    const normalMatrix = Mat4.invert(modelMatrix);
    device.queue.writeBuffer(uniformBuffer, 192, normalMatrix); // Needs to be transposed, so DON'T transpose it

    const camPosition = camera.getPosition()
    device.queue.writeBuffer(uniformBuffer, 256, new Float32Array([...camPosition, params.ambientStrength]));
    device.queue.writeBuffer(uniformBuffer, 272, new Float32Array(
      [params.lightPosition.x, params.lightPosition.y, params.lightPosition.z, params.lightStrength]
    ));
    device.queue.writeBuffer(uniformBuffer, 288, new Float32Array(
      [params.diffuse.r, params.diffuse.g, params.diffuse.b, params.exponent]
    ));

    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.setBindGroup(0, bindGroup);

    // Variable vertex batching
    for (let i = 0; i < tetrahedronModel.length; i += VERTEX_BATCH_SIZE * 6) {
      const end = Math.min(i + VERTEX_BATCH_SIZE * 6, tetrahedronModel.length);
      const verts = tetrahedronModel.subarray(i, end);

      device.queue.writeBuffer(vertexBuffer, 0, verts);
      passEncoder.draw(verts.length / 6);
    }

    passEncoder.end();
    device.pushErrorScope('validation');
    device.queue.submit([commandEncoder.finish()])
    device.popErrorScope().then(e => e && console.error('Error on queue submission: ', e.message));
    requestAnimationFrame(renderFrame);
  }
  requestAnimationFrame(renderFrame);
}

const CAM_SENS = 5.0;
function tick(data: RenderTick) {
  camera.tetherDistance = params.cameraDistance;
  camera.spinSpeed = Number(params.cameraSpin) * 0.2;
  camera.addRotation(
    data.deltaTime * data.drag_movement[0] * CAM_SENS,
    data.deltaTime * data.drag_movement[1] * CAM_SENS);
  camera.tick(data);
}

void InitWebGPU();
