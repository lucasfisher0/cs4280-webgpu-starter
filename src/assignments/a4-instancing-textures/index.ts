//import '@/global.ts'

// External
import {GUI, Controller} from "lil-gui";

// Javascript
import {createBuffer, writeBuffer} from "@/lib/webgpu/buffers";
import {configureContext, getPreferredCanvasFormat} from "@/lib/webgpu/context";
import {createShaderModule} from "@/lib/webgpu/shaders";
import {createDepthTexture, createMultisampleColorTexture, loadTextureFromImageBitmap} from "@/lib/webgpu/texture";

// TypeScript
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import {createCubeGeometry, createSphereGeometry, type IndexedMesh} from "./IndexedMesh.ts";
import {OrbitCamera} from "@/core/render/OrbitCamera.ts";

// Local
import shaderCode from "./shaders.wgsl?raw";
import {ModelNode} from "@/core/scenegraph/ModelNode.ts";
import {Material} from "@/core/render/Material.ts";
import {SceneNode} from "@/core/scenegraph/SceneNode.ts";
import {Texture} from "@/core/render/Texture.ts";
import {perspective} from "@/lib/math/transforms";
import {multiplyAll} from "@/lib/math/mat4";

//#region GUI
const gui = new GUI({container: document.getElementById('controlBox')!});

const hallParams = {
  width: 80,
  length: 80,
  height: 4
};

const fHall = gui.addFolder("Hall");
fHall.add(hallParams, "width", 4, 80, 1).name("Width (m)");
fHall.add(hallParams, "length", 4, 80, 1).name("Length (m)");
fHall.add(hallParams, "height", 0, 4, 0.1).name("Height (m)");


const params = {
  cameraDistance: 5,
  cameraSpin: true,
  depth: 1,
  modelScale: 1,
  diffuse: {r: 1, g: 0, b: 1},
  lightPosition: {x: 0, y: 2, z: 0},
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

const folderLight = gui.addFolder("Light Position");
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
let currTime: number | null = null;

function getDeltaTime(): number {
  const oldTime = currTime;
  currTime = performance.now();
  return !oldTime ? 0.0 : (currTime - oldTime) * 0.001;
}

const tickData: TickData = {deltaTime: 0.0, drag_movement: [0.0, 0.0]};
export const tickEvent = new CustomEvent<TickData>("tick", {
  detail: tickData,
  bubbles: true
})

let pointer_pos: number[] | null = null;
let pointer_last: number[] | null = null;
let dragging = false;

function deg2rad(deg: number) {
  return deg * Math.PI / 180;
}

//#endregion

enum MATERIAL_INDEX {
  Wood = 0,
  Metal = 1,
  Tile = 2
}

class InstancedModelNode extends ModelNode {
  material: MATERIAL_INDEX = 0;
  isVisible: boolean = true;

  getInstanceData(): number[] {
    return [...this.getWorldTransform().toArray(), this.material];//, 0, 0, 0];
  }
}

const scene = new SceneNode({name: "root"});
const camera = new OrbitCamera({name: "Camera"});
camera.clipFar = 500;
scene.addChild(camera);


async function InitWebGPU() {
  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.error("Failed to get adapter.")
    return; // TODO: error popup
  }

  // Canvas
  const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  canvas.addEventListener("resize", () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
  });
  const abortController = new AbortController();
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointer_pos = [e.clientX, e.clientY];
    dragging = true;
  }, {signal: abortController.signal});
  canvas.addEventListener("pointermove", (e) => {
    pointer_pos = [e.clientX, e.clientY];
  }, {signal: abortController.signal});
  canvas.addEventListener("pointerup", () => {
    dragging = false;
    pointer_last = null;
  }, {signal: abortController.signal});
  canvas.addEventListener("pointercancel", () => {
    dragging = false;
    pointer_last = null;
  }, {signal: abortController.signal});

  // WebGPU Device
  const device = await adapter.requestDevice();
  device.onuncapturederror = (event) => {
    console.error("Uncaught WebGPU error:", event.error.message);
  };
  const format = getPreferredCanvasFormat()
  const context = configureContext(canvas, device, format);

  // Load Assets
  const cubeMesh = createCubeGeometry(device, 1);
  const woodTex = new Texture();
  await woodTex.loadTexture(device, "/textures/wood.png");
  const metalTex = new Texture();
  await metalTex.loadTexture(device, "/textures/metal.png");
  const tileTex = new Texture();
  await tileTex.loadTexture(device, "/textures/floortiles.png");


  // SceneGraph
  const floor = new InstancedModelNode(cubeMesh, {name: "Floor"});
  floor.translation = Transform.translate(0, -0.05, 0);
  floor.material = MATERIAL_INDEX.Tile;
  scene.addChild(floor);

  let walls: InstancedModelNode[] = [
    new InstancedModelNode(cubeMesh, {name: "Wall1"}),
    new InstancedModelNode(cubeMesh, {name: "Wall2"}),
    new InstancedModelNode(cubeMesh, {name: "Wall3"}),
    new InstancedModelNode(cubeMesh, {name: "Wall4"})
  ];
  walls.forEach(w => {w.material = MATERIAL_INDEX.Metal; scene.addChild(w)});

  function createDesk(): InstancedModelNode[] {
    let top = new InstancedModelNode(cubeMesh, {name: "top"});
    top.scale = Transform.scale(1.6, 0.05, 0.8);
    top.translation = Transform.translate(0, 0.725,0);

    let leg1 = new InstancedModelNode(cubeMesh, {name: "leg1"});
    leg1.scale = Transform.scale(0.06, 0.70, 0.06);
    leg1.translation = Transform.translate(0.8-0.08, 0.3625, 0.4-0.08);
    let leg2 = new InstancedModelNode(cubeMesh, {name: "leg1"});
    leg2.scale = Transform.scale(0.06, 0.70, 0.06);
    leg2.translation = Transform.translate(0.8-0.08, 0.3625, -0.4+0.08);
    let leg3 = new InstancedModelNode(cubeMesh, {name: "leg1"});
    leg3.scale = Transform.scale(0.06, 0.70, 0.06);
    leg3.translation = Transform.translate(-0.8+0.08, 0.3625, 0.4-0.08);
    let leg4 = new InstancedModelNode(cubeMesh, {name: "leg1"});
    leg4.scale = Transform.scale(0.06, 0.70, 0.06);
    leg4.translation = Transform.translate(-0.8+0.08, 0.3625, -0.4+0.08);

    return [top, leg1, leg2, leg3, leg4];
  }

  // Uniform Buffer
  const UNIFORM_SIZE: number = 84 * 4;
  const uniformBuffer = device.createBuffer({
    size: UNIFORM_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
  const uniformData = new ArrayBuffer(UNIFORM_SIZE);
  const f32 = new Float32Array(uniformData);
  const u32 = new Uint32Array(uniformData);

  const FLOATS_PER_VERTEX = 6;
  const FLOATS_PER_MATRIX = 17;
  const MAX_COPIES = 1420;
  const SPHERES_PER_COPY = 5;
  const instanceBuffer = device.createBuffer({
    size: MAX_COPIES * 5 * FLOATS_PER_MATRIX * 4,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });

  const bindGroupLayout = device.createBindGroupLayout({
    label: "uniform-layout",
    entries: [{
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: {type: 'uniform'}
    },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {type: 'uniform'}
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {type: 'uniform'}
      }]
  });
  const bindGroup = device.createBindGroup({
    label: "uniform-group",
    layout: bindGroupLayout,
    entries: [
      {binding: 0, resource: {buffer: uniformBuffer}},
      {binding: 0, resource: {buffer: uniformBuffer}},
      {binding: 0, resource: {buffer: uniformBuffer}}]
  });

  const shaderModule = device.createShaderModule({code: shaderCode});

  const pipeline = device.createRenderPipeline({
    label: "pipeline",
    layout: device.createPipelineLayout({bindGroupLayouts: [bindGroupLayout]}),
    vertex: {
      module: shaderModule,
      entryPoint: 'vertexMain',
      buffers: [{
        arrayStride: FLOATS_PER_VERTEX * 4,
        attributes: [
          {shaderLocation: 0, offset: 0, format: 'float32x3'},  // position
          {shaderLocation: 1, offset: 12, format: 'float32x3'}, // normal
        ]
      }, { // second buffer layout. Slot 1 advances once per INSTANCE, not per vertex
        arrayStride: FLOATS_PER_MATRIX * 4,
        stepMode: 'instance',
        attributes: [
          { shaderLocation: 2, offset: 0, format: 'float32x4' },  // column 0
          { shaderLocation: 3, offset: 16, format: 'float32x4' }, // column 1
          { shaderLocation: 4, offset: 32, format: 'float32x4' }, // column 2
          { shaderLocation: 5, offset: 48, format: 'float32x4' }, // column 3
          { shaderLocation: 6, offset: 64, format: 'float32' }  // material index
        ]
      }]
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragmentMain',
      targets: [{format}]
    },
    primitive: {topology: 'triangle-list', cullMode: 'back'},
    depthStencil: {format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less'}
  });

  let desks = new SceneNode({name: "Desks"});
  scene.addChild(desks);

  function updateScene() {
    floor.scale = Transform.scale(hallParams.width, 0.1, hallParams.length);

    if (hallParams.height > 0)
    {
      walls[0]!.scale = Transform.scale(0.15, hallParams.height, hallParams.length);
      walls[0]!.translation = Transform.translate((-hallParams.width+0.15) / 2, hallParams.height / 2, 0);
      walls[1]!.scale = Transform.scale(0.15, hallParams.height, hallParams.length);
      walls[1]!.translation = Transform.translate((hallParams.width-0.15) / 2, hallParams.height / 2, 0);
      walls[2]!.scale = Transform.scale(hallParams.width, hallParams.height, 0.15);
      walls[2]!.translation = Transform.translate(0, hallParams.height / 2, (-hallParams.length+0.15) / 2);
      walls[3]!.scale = Transform.scale(hallParams.width, hallParams.height, 0.15);
      walls[3]!.translation = Transform.translate(0, hallParams.height / 2, (hallParams.length-0.15) / 2);
      walls.forEach(w => w.isVisible = true);
    }
    else
      walls.forEach(w => w.isVisible = false);



    desks.children = [];
    let deskCount = 0;

    let rowCount = 1 + Math.floor(((hallParams.width/2) - 1.2) / 2.4) * 2;
    let colCount = 1 + Math.floor(((hallParams.length/2) - 1.2) / 1.8) * 2;

    let xstart = ((rowCount-1) / 2) * -2.4;
    let ystart = ((colCount-1) / 2) * -1.8;

    for (let i = 0; i < rowCount * colCount; i++) {
      const row = Math.floor(i / colCount)
      const col = i % colCount;

      const desk = new SceneNode({name: `Desk${++deskCount}`});
      desk.translation = Transform.translate(
        xstart + row * 2.4,
        0,
        ystart + col * 1.8);
      desk.addChildren(createDesk());
      desks.addChild(desk);
    }
  }

  let depthTexture: GPUTexture | null = null;
  function renderFrame() {
    tick(getDeltaTime());
    updateScene();

    // Depth Texture
    const canvasTexture = context.getCurrentTexture();
    if (depthTexture && (depthTexture.width !== canvasTexture.width || depthTexture.height !== canvasTexture.height)) {
      depthTexture.destroy();
      depthTexture = null;
    }
    if (!depthTexture) {
      depthTexture = device.createTexture({
        size: [canvasTexture.width, canvasTexture.height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      });
    }

    // Uniform Buffer
    const view = camera.getViewMatrix();
    const a = canvas.clientWidth / canvas.clientHeight;
    const proj = perspective(camera.verticalFov, a, camera.clipNear, camera.clipFar);
    const camPosition = camera.getWorldTransform().getPosition();

    f32.set(view.toArray(), 0);
    f32.set(proj, 16);
    f32.set([...camPosition.toArray(), params.ambientStrength], 48);
    f32.set([params.lightPosition.x, params.lightPosition.y, params.lightPosition.z, params.lightStrength], 36);
    f32.set([
      ...[1.0, 1.0, 1.0], // Diffuse RGB
      params.exponent,
      params.specularCoefficient], 40);

    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    // Instance Buffer
    const recurseInstances = (_node: SceneNode): number[][] => {
      let out: number[][] = [];
      _node.children.forEach((child) => out.push(...recurseInstances(child)));
      if (_node instanceof InstancedModelNode && _node.isVisible)
        out.push(_node.getInstanceData());
      return out;
    }
    const instanceList = recurseInstances(scene);// [floor.getInstanceData()];
    device.queue.writeBuffer(instanceBuffer, 0, new Float32Array(instanceList.flat()));

    // Encoders
    const commandEncoder = device.createCommandEncoder({label: 'frame-encoder'});
    const pass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: canvasTexture.createView(),
        clearValue: {r: 0.05, g: 0.05, b: 0.05, a: 1.0},
        loadOp: "clear",
        storeOp: "store"
      }],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);

    pass.setVertexBuffer(0, cubeMesh.vertexBuffer);
    pass.setVertexBuffer(1, instanceBuffer);
    pass.setIndexBuffer(cubeMesh.indexBuffer, cubeMesh.indexFormat);
    pass.drawIndexed(cubeMesh.indexCount, instanceList.length, 0, 0, 0);

    pass.end();
    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(renderFrame);
  }

  requestAnimationFrame(renderFrame);
}


function tick(deltaTime: number) {
  tickData.deltaTime = deltaTime;
  tickData.drag_movement = [0.0, 0.0];

  if (dragging && pointer_pos) {
    if (pointer_last) {
      tickData.drag_movement = [
        pointer_pos[0]! - pointer_last[0]!,
        pointer_pos[1]! - pointer_last[1]!];
    }
    pointer_last = pointer_pos;
  }

  camera.tick(tickData);
  window.dispatchEvent(tickEvent);
}

InitWebGPU();
