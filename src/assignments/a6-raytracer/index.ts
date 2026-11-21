import {initializeWebGPU, FColor, animate} from "./webgpu.ts";
import shaderCode from "./shaders.wgsl?raw";
import {GUI, Controller} from "lil-gui";

import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts";
// import {createCubeGeometry} from "@/core/render/IndexedMesh.ts";

import * as Shapes from "@/core/collision/Shapes.ts"
import {HitRecord, Ray} from "@/core/raytracing/Ray.ts";

const deg2rag = (deg: number)=> {
  return deg * Math.PI / 180;
}

const state = {
  resolutionScale: 0.5,
  useCarBounds: true,
  maxDepth: 3,

  // Camera
  yaw: 25,
  pitch: 12,
  distance: 5.5,

  // Stats
  progress: 0,
  raysTraced: 0,
  triangleTests: 0
};

// GUI
const gui = new GUI({ title: "Controls", container: document.getElementById( "controlBox" )! });

const guiRender = gui.addFolder("Render")
guiRender.add(state, "resolutionScale");
guiRender.add(state, "useCarBounds");
guiRender.add(state, "maxDepth", 0, 3, 1);

const guiCamera = gui.addFolder("Camera")
guiCamera.add(state, "yaw", -45, 45, 1);
guiCamera.add(state, "pitch", 3, 30, 1);
guiCamera.add(state, "distance", 2, 5.5, 1);

const guiStats = gui.addFolder("Stats");
guiStats.add(state, "progress").listen().disable();
guiStats.add(state, "raysTraced").listen().disable();
guiStats.add(state, "triangleTests").listen().disable();

async function init() {
  try {
    const {canvas, device, context, format} = await initializeWebGPU('gpu-canvas');

    const shaderModule = device.createShaderModule({ code: shaderCode });
    const pipeline = device.createRenderPipeline({
      label: "pipeline",
      layout: "auto",
      vertex: { module: shaderModule, entryPoint: 'vs'},
      fragment: { module: shaderModule, entryPoint: 'fs', targets: [{format}] },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' }
    });


    // ---------- Scene ----------
    //const background = [0.6, 0.7, 0.9];
    const background = new Vec3(1.0, 1.0, 1.0);

    const room = new Shapes.Box({
      min: new Vec3(-4, 0,  -3.5),
      max: new Vec3( 4, 3.8, 5),
    });
    room.kd = new Vec3(0.5);
    const mirror = new Shapes.Box({
      min: new Vec3(-4, 0.9,  -2.5),
      max: new Vec3(-4, 2.7,   0.5),
    });
    mirror.rho = 1;
    const boxspring = new Shapes.Box({
      min: new Vec3(-1.5, 0, -3.5),
      max: new Vec3(1.5, 0.4, 0.7),
    });
    boxspring.kd = new Vec3(0.2);
    const mattress = new Shapes.Box({
      min: new Vec3(-1.4, 0.4, -3.5),
      max: new Vec3(1.5, 0.4, 0.7),
    });
    mattress.kd = new Vec3(0.8);
    const silverBall = new Shapes.Sphere(new Vec3(-0.75, 1.0, 0.15), 0.3);
    const redBall = new Shapes.Sphere(new Vec3(2.2, 0.4, -0.9), 0.4);
    const scene: Shapes.Shape[] = [room, mirror, boxspring, mattress, silverBall, redBall];
    function sceneHit(ray: Ray, t0: number, t1: number): HitRecord | undefined {
      let closest: HitRecord | undefined;
      for (const surf of scene) {
        state.raysTraced++;
        const rec = surf.hit(ray, t0, t1);
        if (rec)
        {
          const hits = Array.isArray(rec) ? rec : [rec];
          if (hits.length < 1)
            continue;
          closest = hits[0]!;
          t1 = closest.t;
        }
      }
      return closest;
    }




    // ---------- Shading ----------
    const lightPos = new Vec3(-1, 3.2, 2.4);
    const alpha = 0.15;           // ambient fraction
    const ks = 0.4, p = 32;       // highlight
    const eps = 1e-4, delta = 1e-3;
    const maxDepth = 3;

    function shadeRay(ray: Ray, t0: number, t1: number, depth: number = 0): Vec3 {
      const rec = sceneHit(ray, t0, t1);
      if (!rec)
        return background;

      console.log("Hit: " + rec.shape!.constructor.name);

      const x = rec.position;
      const d = ray.direction;
      const n = Vec3.dot(rec.normal, d) > 0 ? rec.normal.negate() : rec.normal;
      const ka = rec.shape!.ka;
      const kd = rec.shape!.kd;
      const ks = rec.shape!.ks;
      const ns = rec.shape!.ns;

      const r = Vec3.sub(lightPos, x).length();
      const l = Vec3.sub(x, lightPos).scale(1 / r);
      const v = d.normalize().negate();
      const h = Vec3.add(l, v).normalize();

      const shadowRay = new Ray(Vec3.add(rec.position!, n!.scale(delta)), l);
      const inShadow = (sceneHit(shadowRay, eps, r)?.t ?? Infinity) < Infinity;

      // c = kd (alpha + (1 - alpha) max(0, n·l)) + ks max(0, n·h)^p
      let c = ka.scale(alpha);
      // if (!inShadow && Vec3.dot(n, l) > 0) {
      //   const spec = ks.scale(Math.max(0, Vec3.dot(n, h)) ** p);
      //   c = Vec3.add(kd.scale(alpha + (1 - alpha) * Vec3.dot(n, l)), spec);
      // }
//
      // // Mirror: r = d - 2(d·n)n, blended as c = (1 - rho) c + rho c_reflected
      // const rho = rec.shape!.rho;
      // if (rho > 0 && depth < maxDepth) {
      //     const rdir = Vec3.sub(d, n.scale(2 * Vec3.dot(d, n)));
      //     const mirrorRay = new Ray(Vec3.add(x, n.scale(delta)), rdir);
      //     c = Vec3.add(
      //       c.scale(1 - rho),
      //       shadeRay(mirrorRay, eps, Infinity, depth+1).scale(rho)
      //     );
      //   }
      return c;
    }

    // ---------- Render: one ray per pixel center ----------
    let pixels: Uint8Array;
    let start: DOMHighResTimeStamp;
    let texture: GPUTexture;
    let sampler: GPUSampler;
    let bindGroup: GPUBindGroup;
    let cursor: number;
    let nx: number;
    let ny: number;
    let r: number;
    let t: number;
    let e: Vec3;
    let target: Vec3;
    let up: Vec3;
    let fovy: number;
    let w: Vec3;
    let u: Vec3;
    let v: Vec3;
    const restart = () => {
      pixels = new Uint8Array(canvas.width * canvas.height * 4); // RGBA, row 0 at the top
      nx = Math.floor(canvas.width * state.resolutionScale);
      ny = Math.floor(canvas.height * state.resolutionScale);
      cursor = 0;

      // ---------- Camera ----------
      const camOrigin: Mat4 = Transforms.translate(0, 0.9, -1);
      const camTether: Mat4 = Mat4.multiply(
        Transforms.fromEulerZYX(state.pitch, state.yaw, 0),
        Transforms.translate(0, 0, -state.distance)
      );
      e = Mat4.multiply(camTether, camOrigin).position();

      target = new Vec3(0, 0.3, 0);
      up = new Vec3(0, 1, 0);
      fovy = (state.yaw * Math.PI) / 180;

      w = Vec3.sub(target, e).negate().normalize();
      u = Vec3.cross(up, w).normalize();
      v = Vec3.cross(w, u);

      t = Math.tan(fovy / 2); // window top
      r = (nx / ny) * t;      // window right

      if (texture)
        texture.destroy();
      texture = device.createTexture({size: [nx, ny], format: "rgba8unorm", usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING });
      sampler = device.createSampler({magFilter: "nearest", minFilter: "nearest"});

      bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {binding: 0, resource: sampler},
          {binding: 1, resource: texture.createView()}
        ]
      });
    }

    // Link changed GUI controls to force re-render
    let drawing = false;
    const controllerTriggers = [...guiRender.controllers, ...guiCamera.controllers];
    controllerTriggers.forEach((control) => {
      control.onFinishChange( () => {
        restart();
      })
    })

    restart();
    animate(
      canvas,
      device,
      context,
      "fps-label",
      null,
      (renderPass: GPURenderPassEncoder, dt: number, aspect: number, time: number) => {
        drawing = true;
        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, bindGroup);
        renderPass.draw(3);


        //console.log(`Cursor: ${cursor}, Size: ${nx}, ${ny}`);
        if (cursor >= (nx * ny))
          return;

        const tracePixel = (x: number, y: number) => {
          const sx = x + 0.5, sy = y + 0.5;
          const us = ((2 * sx) / nx - 1) * r;
          const vs = (1 - (2 * sy) / ny) * t;
          const d = Vec3.sub(Vec3.add(u.scale(us), v.scale(vs)), w).normalize();

          const c = shadeRay(new Ray(e, d), 0, Infinity);
          pixels.set([c.x * 255, c.y * 255, c.z * 255, 255], (y * nx + x) * 4);
          // console.warn(`Trace Pixel: (${x},${y}). Set pixel ${(y * nx + x) * 4} to ${c}`)
        }

        //console.warn("Hit1");

        let x = cursor % nx;
        let y = (cursor - x) / nx;
        const startTrace = performance.now();
        while (performance.now() - startTrace < 0.12) {
          if (x >= nx) {
            x = 0;
            y++;
          }
          tracePixel(x++, y);
          //
          cursor++;
        }

        device.queue.writeTexture({ texture }, pixels, { bytesPerRow: nx * 4 }, [nx, ny]);
        drawing = false;
      });
  } catch (error) {
    console.error("WebGPU Initialization Error:", error);
    const statusElem = document.getElementById("status");
    if (statusElem && error instanceof Error)
      statusElem.textContent = "WebGPU Initialization Error:\n" + error.message;
  }
}

window.addEventListener('DOMContentLoaded', init);
