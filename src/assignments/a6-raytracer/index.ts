import {initializeWebGPU, FColor, animate} from "./webgpu.ts";
import {Camera} from "@/core/components/Camera.ts";
import {SceneNode} from "@/core/scenegraph/SceneNode.ts";
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

    const bindGroupLayout = device.createBindGroupLayout({
      label: "triangle-textured",
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} }
      ]
    });
    const shaderModule = device.createShaderModule({ code: shaderCode });
    const pipeline = device.createRenderPipeline({
      label: "pipeline",
      layout: device.createPipelineLayout({bindGroupLayouts: [bindGroupLayout]}),
      vertex: {
        module: shaderModule,
        entryPoint: 'vertexMain'
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragmentMain',
        targets: [{format}]
      },
      primitive: {topology: 'triangle-list'},
      depthStencil: { format: "depth24plus", depthWriteEnabled: false, depthCompare: "always" }
    });

    let pixels;
    let texture;
    let sampler;
    let bindGroup;
    let cursor = 0;
    let aspect = 0;
    const restart = () => {
      pixels = new Uint8Array(canvas.width * canvas.height * 4); // RGBA, row 0 at the top
      texture = device.createTexture({size: [canvas.width, canvas.height], format: "rgba8unorm", usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING });
      sampler = device.createSampler({magFilter: "nearest", minFilter: "nearest"});

      bindGroup = device.createBindGroup({
        label: "uniform-group",
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: sampler },
          { binding: 1, resource: texture.createView() }
        ]
      });

      cursor = 0;
      aspect = canvas.width / canvas.height;
    }

    restart();
    animate(
      canvas,
      device,
      context,
      "fps-label",
      null,
      (renderPass: GPURenderPassEncoder, dt: number, aspect: number, time: number) => {
        if (cursor < (canvas.width * canvas.height))
          return;

        const tracePixel = (x: number, y: number) => {}

        let x = cursor % canvas.width;
        let y = (cursor - x) / canvas.width;
        while (dt < 0.1) {
          if (x >= canvas.width) {
            x = 0;
            y++;
          }
          tracePixel(x, y);
          cursor++;




















        }






        renderPass.draw(3);








      });
  } catch (error) {
    console.error("WebGPU Initialization Error:", error);
    const statusElem = document.getElementById("status");
    if (statusElem && error instanceof Error)
      statusElem.textContent = "WebGPU Initialization Error:\n" + error.message;
  }
}

window.addEventListener('DOMContentLoaded', init);
