//import '@/global.ts'

// External
import {GUI, Controller} from "lil-gui";

// Javascript
import {createBuffer, writeBuffer} from "@/lib/webgpu/buffers";
import {configureContext, getPreferredCanvasFormat} from "@/lib/webgpu/context";
import {createShaderModule} from "@/lib/webgpu/shaders";
import {createDepthTexture, createMultisampleColorTexture, loadTextureFromImageBitmap} from "@/lib/webgpu/texture";

// TypeScript
import {createCubeGeometry, createSphereGeometry} from "@/core/render/IndexedMesh.ts";
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import {type IndexedMesh} from "@/core/render/IndexedMesh.ts"
import {OrbitCamera} from "@/core/render/OrbitCamera.ts";

// Local
import shaderCode from "./shaders.wgsl?raw";
//import type {PointerMovement, TickData} from "@/core/TickData.ts";
import {Renderer} from "@/core/render/Render.ts";
import {ModelNode} from "@/core/scenegraph/ModelNode.ts";
import {Material} from "@/core/render/Material.ts";

//#region GUI
const gui = new GUI( { container: document.getElementById( 'controlBox' )! } );

const hallParams = {
  width: 4,
  length: 4,
  height: 4
};

const fHall = gui.addFolder("Hall");
fHall.add(hallParams, "width", 4, 80, 1);
fHall.add(hallParams, "height", 4, 80, 1);
fHall.add(hallParams, "height", 0, 4, 0.1);


const params = {
  cameraDistance: 5,
  cameraSpin: true,
  depth: 1,
  modelScale: 1,
  diffuse: {r: 1, g: 0, b: 1},
  lightPosition: {x: 0, y: 0, z: 0},
  lightStrength: 0.8,
  ambientStrength: 0.2,
  specularCoefficient: 0.8,
  exponent: 1000,
};

const folderModel = gui.addFolder("Model");
folderModel.add(params, "modelScale", 0.5, 3, 0.25).name("Model Scale");
const diffuseControl = folderModel.addColor(params, "diffuse").name("Diffuse Color");
const specularControl = folderModel.add(params, "specularCoefficient", 0, 1, 0.1).name("Specular Coefficient");
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
const lightStrengthControl = gui.add(params, "lightStrength", 0, 1.5, 0.1).name("Light Strength");
const AmbientStrengthControl = gui.add(params, "ambientStrength", 0.0, 1, 0.05).name("Ambient Strength");
//#endregion

//#region Utility
function deg2rad(deg: number) {
  return deg * Math.PI / 180;
}
//#endregion

async function InitWebGPU() {
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.error("Failed to get adapter.")
    return; // TODO: error popup
  }
  const device = await adapter.requestDevice();

  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  using renderer: Renderer = new Renderer(device, canvas);
  const scene = renderer.scene;

  const cubeMesh = createCubeGeometry(device, 1);
  const cubeNode = new ModelNode(cubeMesh, new Material(), {
    name: "Cube",
  });
  scene.addChild(cubeNode);

  window.addEventListener("tick", (event) => {
    tick(event.detail);
  });

  function renderFrame() {
    renderer.renderFrame();
    requestAnimationFrame(renderFrame);
  }
  requestAnimationFrame(renderFrame);
}


function tick(detail: TickData) {
  // NOOP yet
}

InitWebGPU();
