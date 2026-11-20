import {initializeWebGPU, FColor, animate} from "./webgpu.ts";
import {Camera} from "@/core/components/Camera.ts";
import {SceneNode} from "@/core/scenegraph/SceneNode.ts";
import {createShaderModule} from "@/lib/webgpu/shaders";
import shaderCode from "./shaders.wgsl?raw";
import {GUI, Controller} from "lil-gui";

import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts";


const state = {};

// GUI

async function init() {
  try {
    const {canvas, device, context, format} = await initializeWebGPU('gpu-canvas');

    const scene = new SceneNode({name: "root"});
    const camera = new Camera({name: "Camera", canvasId: "gpu-canvas"}).addToNode(scene);
    camera.clipFar = 500;

    //#region UNIFORM
    const UNIFORM_SIZE: number = 84 * 4;
    device.pushErrorScope('validation');
    let uniformBuffer: GPUBuffer = device.createBuffer({
      label: "uniform",
      size: UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.popErrorScope().then(e => e && console.error('uniform buffer error:', e.message));
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

      });
  } catch (error) {
    console.error("WebGPU Initialization Error:", error);
    const statusElem = document.getElementById("status");
    if (statusElem && error instanceof Error)
      statusElem.textContent = "WebGPU Initialization Error:\n" + error.message;
  }
}

window.addEventListener('DOMContentLoaded', init);
