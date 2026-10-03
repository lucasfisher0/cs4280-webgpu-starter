import {createShaderModule} from "@/lib/webgpu/shaders";
// @ts-ignore
import shaderCode from "./shaders.wgsl?raw";
import {CUBE_VERTICES, AXIS_VERTICES} from "./cube";
import {Camera} from "./camera";
import {configureContext} from "@/lib/webgpu/context";
import GUI, {Controller} from "lil-gui";
import {Entity} from "@/assignments/a2-transforms-camera/entity";
import {identity as matrixIdentity, multiply, multiplyAll, transpose} from "@/lib/math/mat4";
import {
  fromEulerZYX,
  ortho,
  perspective,
  scale as matrixScale,
  shear,
  translate as matrixTranslate
} from "@/lib/math/transforms";

function deg2rad(deg: number) {
  return deg * Math.PI / 180;
}

//#region GUI
const gui = new GUI( { container: document.getElementById( 'controlBox' )! } );
const params = {
  cameraDistance: 5,
  cameraSpin: true,
  translate: {x: 0, y: 0, z: 0},
  rotate: {x: 0, y: 0, z: 0},
  scale: {x: 1, y: 1, z: 1},
  universalScale: 1,
  shear: {x: 0, y: 0, z: 0},
  order: "TRS-Shear",
};

const folderCamera = gui.addFolder("Camera");
const distanceControl = folderCamera.add(params, "cameraDistance", 2, 12, 0.1).name("Distance");
folderCamera.add(params, "cameraSpin").name("Spin");

const folderTransform = gui.addFolder( "Translate" );
for (const key in params.translate) {
  const elem = folderTransform.add(params.translate, key as keyof typeof params.translate, -1, 1)
    .name(key.toUpperCase())
    .domElement!.parentElement!;

  elem.classList.add("inline-gui-property");
  elem.style = "width: 33.33%;";
}

const folderRotate = gui.addFolder( "Rotate (°)" );
for (const key in params.rotate) {
  const elem = folderRotate.add(params.rotate, key as keyof typeof params.rotate, -180, 180)
    .name(key.toUpperCase())
    .domElement!.parentElement!;

  elem.classList.add("inline-gui-property");
  elem.style = "width: 33.33%;";
}

const folderScale = gui.addFolder( "Scale" );
let scaleControls: Controller[] = [];
scaleControls.push(folderScale.add(params.scale, "x", 0.3, 2, 0.05))
scaleControls.push(folderScale.add(params.scale, "z", 0.3, 2, 0.05));
scaleControls.push(folderScale.add(params.scale, "y", 0.3, 2, 0.05));
scaleControls.push(folderScale.add(params, "universalScale", 0.3, 2, 0.05)
  .name("Universal")
  .onChange(() => {
    params.scale.x = params.universalScale;
    params.scale.y = params.universalScale;
    params.scale.z = params.universalScale;
    scaleControls.forEach((control: Controller) => {
      control.updateDisplay();
    })}));

/*
for (const key in params.scale) {
  const elem = folderScale.add(params.scale, key as keyof typeof params.scale, 0.3, 2, 0.05)
    .name(key.toUpperCase())
    .domElement!.parentElement!;

  elem.classList.add("inline-gui-property");
  elem.style = "width: 33.33%;";
}
 */

const folderShear = gui.addFolder( "Shear" );
for (const key in params.shear) {
  const elem = folderShear.add(params.shear, key as keyof typeof params.shear, -1, 1, 0.05)
    .name(key.toUpperCase())
    .domElement!.parentElement!;

  elem.classList.add("inline-gui-property");
  elem.style = "width: 33.33%;";
}

gui.add(params, 'order', ["TRS-Shear", "Shear-TRS"])
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
const cam_sens = 1;
let pointer_pos: number[] | null = null;
let pointer_last: number[] | null = null;
let dragging = false;

const cube = new Entity();

async function InitWebGPU() {
//#region Initialization
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return;
  }
  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const device: GPUDevice = await adapter.requestDevice();
  const format = navigator.gpu.getPreferredCanvasFormat();
  const context = configureContext(canvas, device, format);
//#endregion

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointer_pos = [e.clientX, e.clientY];
    dragging = true;
  });
  canvas.addEventListener("pointermove", (e) => {
    pointer_pos = [e.clientX, e.clientY];
  });
  canvas.addEventListener("pointerup", () => { dragging = false; pointer_last = null; });
  canvas.addEventListener("pointercancel", () => { dragging = false; pointer_last = null; });

  canvas.addEventListener("wheel", (e: WheelEvent) => {
    params.cameraDistance = Math.max(Math.min(params.cameraDistance + e.deltaY*0.005, 12), 2);
    distanceControl.updateDisplay();
  });

//#region Uniform
  const UNIFORM_SIZE: number = 16 * 4; // one mat4x4<f32>: mvp
  device.pushErrorScope('validation');
  let uniformBuffer: GPUBuffer = device.createBuffer({
    label: "transform-uniform",
    size: UNIFORM_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.popErrorScope().then(e => e && console.error('uniform buffer error:', e.message));

  const bindGroupLayout: GPUBindGroupLayout = device.createBindGroupLayout({
    label: "u-layout",
    entries: [{
      binding: 0,
      visibility: GPUShaderStage.VERTEX,
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
//#endregion

//#region CUBE
  const vertexBuffer = device.createBuffer({
    label: "triangle-vertices",
    size: CUBE_VERTICES.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(vertexBuffer, 0, CUBE_VERTICES);

  device.pushErrorScope('validation');
  const shaderModule = createShaderModule(device, shaderCode, "cube");
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

  const axisBuffer = device.createBuffer({
    label: "axis-vertices",
    size: AXIS_VERTICES.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(axisBuffer, 0, AXIS_VERTICES);

  const axisPipeline = device.createRenderPipeline({
    label: "axis-pipeline",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    vertex: {
      module: shaderModule,
      entryPoint: "vertexAxis",
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
      topology: "line-list"
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus'
    }
  });
  device.popErrorScope().then(e => e && console.error('axis pipeline error:', e.message));




//#region Frame
  let depthTexture: GPUTexture | null = null;
  function renderFrame() {
    const deltaTime = getDeltaTime();
    camera.tetherDistance = params.cameraDistance;
    camera.spinSpeed = Number(params.cameraSpin) * 0.2;

    if (dragging && pointer_pos)
    {
      if (pointer_last)
      {
        const dx = pointer_pos[0]! - pointer_last[0]!;
        const dy = pointer_pos[1]! - pointer_last[1]!;
        camera.addRotation(dx * cam_sens * deltaTime, dy * cam_sens * deltaTime);
      }

      pointer_last = pointer_pos;
    }
    camera.tick(deltaTime);

    // Model
    cube.translation = matrixTranslate(params.translate.x, params.translate.y, params.translate.z);
    cube.rotation = fromEulerZYX(deg2rad(params.rotate.z), deg2rad(params.rotate.y), deg2rad(params.rotate.x));
    cube.scale = matrixScale(params.scale.x, params.scale.y, params.scale.z);

    const modelMatrix = params.order == "TRS-Shear" ?
      multiply(cube.getTransformMatrix(), shear(params.shear.x, 0, params.shear.y, 0, params.shear.z, 0)) :
      multiply(shear(params.shear.x, 0, params.shear.y, 0, params.shear.z, 0), cube.getTransformMatrix());

    // Projection
    const a = canvas.clientWidth/canvas.clientHeight;
    const projectionMatrix = perspective(camera.verticalFov, a, camera.clipNear, camera.clipFar);
    const mvp = multiplyAll([modelMatrix, camera.getViewMatrix(), projectionMatrix]);

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

    device.queue.writeBuffer(uniformBuffer, 0, transpose(mvp));
    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(36); // 6 faces x 2 triangles x 3 vertices

    passEncoder.setPipeline(axisPipeline);
    passEncoder.setVertexBuffer(0, axisBuffer);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(6);

    passEncoder.end();
    device.pushErrorScope('validation');
    device.queue.submit([commandEncoder.finish()])
    device.popErrorScope().then(e => e && console.error('error:', e.message));
    requestAnimationFrame(renderFrame);
  }
//#endregion
  requestAnimationFrame(renderFrame);
}

InitWebGPU();
//window.addEventListener("DOMContentLoaded", InitWebGPU);
