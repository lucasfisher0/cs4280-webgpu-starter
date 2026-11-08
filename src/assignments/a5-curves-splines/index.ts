import {initializeWebGPU, FColor, animate} from "./webgpu.ts";
import {SceneNode} from "@/core/scenegraph/SceneNode.ts";
import {createShaderModule} from "@/lib/webgpu/shaders";
import shaderCode from "./shaders.wgsl?raw";
import {GUI, Controller} from "lil-gui";

import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts";
import {InputManager} from "@/core/InputManager.ts";
import {Camera} from "@/core/components/Camera.ts";
import {perspective} from "@/core/math/Transform.ts";
import {fromString, parseMTL, DEFAULT_MATERIAL} from "@/core/assets/Wavefront.ts";
import {SplineNode} from "@/core/components/SplineNode.ts";

enum Mode {
  DESIGN = 0,
  DRIVE = 1
}

const state = {
  mode: Mode.DESIGN,
};

//#region GUI
const gui = new GUI();
gui.add({callback: () => state.mode = Mode.DESIGN}, "callback").name("Design");
gui.add({callback: () => state.mode = Mode.DRIVE}, "callback").name("Design");
//#endregion


async function loadCar() {


  const carOBJ = await fetch("a5/car.obj");
  let {positions, texcoords, normals, triangles, materialLibraries} = fromString(await carOBJ.text());

  const carMTL = await fetch("a5/car.mtl");
  let materials = parseMTL(await carMTL.text());

  // Make ONE vertex for each corner-- UNINDEX THE MESH.
}

async function init() {
  try {
    const {canvas, device, context, format} = await initializeWebGPU('gpu-canvas');

    //#region SCENE
    const scene = new SceneNode({name: "root"});
    const designCamera = new Camera({
      name: "Design Camera",
      canvasId: "gpu-canvas",
      clipFar: 500,
      lockMovement: true,
      lockRotation: true
    }).addToNode(scene);

    const splineNode = new SplineNode(device, format, {
      name: "SplineNode"}
    ).addToNode(scene);

    const driveCamera = new Camera({
      name: "Drive Camera",
      canvasId: "gpu-canvas",
      clipFar: 500
    }).addToNode(scene);
    //#endregion

    //#region UNIFORM
    const UNIFORM_SIZE: number = 84 * 4;
    device.pushErrorScope('validation');
    let uniformBuffer: GPUBuffer = device.createBuffer({
      label: "uniform",
      size: UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.popErrorScope().then(e => e && console.error('uniform buffer error:', e.message));
    const uniformData = new ArrayBuffer(UNIFORM_SIZE);
    const f32 = new Float32Array(uniformData);
    const u32 = new Uint32Array(uniformData);
    //endregion

    //#region SHADERS
    device.pushErrorScope('validation');
    const shaderModule = createShaderModule(device, shaderCode, "shaders");
    device.popErrorScope().then(e => e && console.error('Shader Module error:', e.message));
    //endregion

    //#region BIND GROUPS
    device.pushErrorScope('validation');
    const bindGroupLayout = device.createBindGroupLayout({
      label: "uniform-layout",
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {type: 'uniform'}
      }]
    });
    device.popErrorScope().then(e => e && console.error('Bind Group Layout error:', e.message));
    device.pushErrorScope('validation');
    const bindGroup = device.createBindGroup({
      label: "uniform-group",
      layout: bindGroupLayout,
      entries: [
        {binding: 0, resource: {buffer: uniformBuffer}}
      ]
    });
    device.popErrorScope().then(e => e && console.error('Bind Group error:', e.message));
    //endregion

    const FLOATS_PER_VERTEX = 6;
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

    animate(
      canvas,
      device,
      context,
      "fps-label",
      null,
      (renderPass: GPURenderPassEncoder, dt: number, aspect: number, time: number) => {

        designCamera.orthoBound = {
          width:  new Vec2(-10 * aspect, 10 * aspect),
          height: new Vec2(-1.0, 1.0),
        };


        // Scene: Tick nodes and update transforms
        scene.traverse((node, parent) => {
          node.tick(dt);
          if (parent)
            node.updateWorldTransform(parent.worldTransform);
        });

        // Uniform Buffer - Mesh Drawing
        const model = Mat4.Identity();
        const view = Camera.activeCamera.getViewMatrix();
        const proj = Camera.activeCamera.getProjection();

        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // SET PIPELINE -> SET BIND GROUPS -> DRAW MESHES

        // Spline Nodes
        splineNode.draw(renderPass);
      });
  } catch (error) {
    console.error("WebGPU Initialization Error:", error);
    const statusElem = document.getElementById("status");
    if (statusElem && error instanceof Error)
      statusElem.textContent = "WebGPU Initialization Error:\n" + error.message;
  }
}

window.addEventListener('DOMContentLoaded', init);
window.addEventListener("onkeydown", (e) => InputManager.handleKeyDown(e as KeyboardEvent));
window.addEventListener("onkeyup", (e) => InputManager.handleKeyUp(e as KeyboardEvent));
