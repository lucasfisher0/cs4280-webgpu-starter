import {createShaderModule} from "@/lib/webgpu/shaders";
// @ts-ignore
import shaderCode from "./shaders.wgsl?raw";
import {Camera} from "@/lib/render/Camera";
import type {RenderTick} from "@/lib/render/Render"
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

import {Renderer} from "@/lib/render/Render";

import {Material, DEFAULT_MATERIAL} from "@/lib/render/Material";
DEFAULT_MATERIAL.shader = ["DEFAULT", shaderCode];

import {makeTetrahedron} from "@/assignments/a3-sierpinski-gasket/tetrahedron";


function deg2rad(deg: number) {
  return deg * Math.PI / 180;
}

//#region GUI
const gui = new GUI( { container: document.getElementById( 'controlBox' )! } );
const params = {
  cameraDistance: 5,
  cameraSpin: true,
  lightPosition: {x: 0, y: 0, z: 0},
  ambientLight: {r: 128, g: 128, b: 128},
  specularLight: {r: 128, g: 128, b: 128},
  exponent: 10,
};


const folderCamera = gui.addFolder("Camera");
const distanceControl = folderCamera.add(params, "cameraDistance", 2, 12, 0.1).name("Distance");
folderCamera.add(params, "cameraSpin").name("Spin");

const folderTransform = gui.addFolder( "Translate" );
for (const key in params.lightPosition) {
  const elem = folderTransform.add(params.lightPosition, key as keyof typeof params.lightPosition, -1, 1)
    .name(key.toUpperCase())
    .domElement!.parentElement!;

  elem.classList.add("inline-gui-property");
  elem.style = "width: 33.33%;";
}

//#endregion

const camera = new Camera();

const tetrahedron = new Entity();
const tetrahedron_verts = makeTetrahedron();

async function InitWebGPU() {
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return;
  }
  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  const renderer = new Renderer(adapter, canvas);
  await renderer.init();


//#region UNIFORM
  /*
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
  */
//endregion

//#region CUBE
  /*
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
  */
//#endregion


  /*
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
    */



  addEventListener("tick", (e: Event) => {
    const tickEvent = e as CustomEvent<RenderTick>;
    tick(tickEvent.detail);
  })

  function renderFrame() {


    // Model
    const modelMatrix = Mat4.identity();

    // Projection
    const a = canvas.clientWidth/canvas.clientHeight;
    const projectionMatrix = perspective(camera.verticalFov, a, camera.clipNear, camera.clipFar);
    const mvp = Mat4.multiplyAll([modelMatrix, camera.getViewMatrix(), projectionMatrix]);

    renderer.renderFrame();
    requestAnimationFrame(renderFrame);
  }
  requestAnimationFrame(renderFrame);
}

function tick(data: RenderTick) {
  camera.tetherDistance = params.cameraDistance;
  camera.spinSpeed = Number(params.cameraSpin) * 0.2;
  camera.tick(data);
}

InitWebGPU();
