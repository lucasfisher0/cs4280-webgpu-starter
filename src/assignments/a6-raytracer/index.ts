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
import {parseOBJ, parseMTL} from "@/core/assets/Wavefront.ts";
import carOBJ from "./car.obj?raw";
import carMTL from "./car.mtl?raw";


const deg2rad = (deg: number)=> {
  return deg * Math.PI / 180;
}

const state = {
  resolutionScale: 0.5,
  useCarBounds: true,
  maxDepth: 3,

  // Camera
  yaw: 25,
  pitch: 12,
  distance: 5.2,

  // Stats
  progress: "0%",
  raysTraced: 0,
  triangleTests: 0
};

// GUI
const gui = new GUI({ title: "Controls", container: document.getElementById( "controlBox" )! });

const guiRender = gui.addFolder("Render")
guiRender.add(state, "resolutionScale", 0.1, 2, 0.1);
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


    // ---------- Objects ----------
    //const background = [0.6, 0.7, 0.9];
    const background = new Vec3(0.566, 0.658, 0.960);
    const background2 = new Vec3(0.205, 0.246, 0.380);

    const room = new Shapes.Box({
      min: new Vec3(-4, 0,  -3.5),
      max: new Vec3( 4, 3.8, 5),
    });
    room.kd = (x: Vec3, n: Vec3) => {
      const woodLight = new Vec3(0.8235, 0.7059, 0.5490);
      const woodDark = new Vec3(0.3608, 0.1725, 0.1137);
      const wall = new Vec3(0.7784, 0.7588, 0.7196);
      const ceiling = new Vec3(0.9804, 0.8980, 0.7451);

      if (n.y > 0)
      {
        const xp = Math.abs(x.x) % 0.8;
        return xp > 0.4 ? woodLight : woodDark;
      }
      if (n.y < 0)
        return ceiling;
      else
        return new Vec3(0.2);
        //return wall;
    }

    const mirror = new Shapes.Box({
      min: new Vec3(-4.01, 0.9,  -2.5),
      max: new Vec3(-3.99, 2.7,   0.5),
    });
    mirror.rho = 1;

    const boxspring = new Shapes.Box({
      min: new Vec3(-1.5, 0, -3.5),
      max: new Vec3(1.5, 0.4, 0.7),
    });
    boxspring.kd = (x: Vec3, n: Vec3) => {
      return new Vec3(0.7843, 0.6196, 0.4157);
    }

    const mattress = new Shapes.Box({
      min: new Vec3(-1.4, 0.4, -3.5),
      max: new Vec3(1.4, 0.7, 0.6),
    });
    mattress.kd = (x: Vec3, n: Vec3) => {
      const light = new Vec3(0.6980, 0.1333, 0.1333);
      const dark = new Vec3(0.0980, 0.1451, 0.2902);

      if (n.y > 0) {
        const xp = Math.abs(x.x) % 0.7;
        const zp = Math.abs(x.z) % 0.7;
        return (xp > 0.35 !== zp > 0.35) ? light : dark;
      }
      else return dark;
    }

    const silverBall = new Shapes.Sphere(new Vec3(-0.75, 1.0, 0.15), 0.3);
    silverBall.kd = () => { return new Vec3(0.98); }
    silverBall.ks = () => { return new Vec3(1); }
    silverBall.ns = 256;
    silverBall.rho = 0.85;

    const redBall = new Shapes.Sphere(new Vec3(2.2, 0.4, -0.9), 0.4);
    redBall.kd = () => { return new Vec3(1, 0, 0); }


    // ------------------ LOAD CAR
    let {positions, texcoords, normals, triangles, materialLibraries} = parseOBJ(carOBJ);

    const carTransform = Mat4.multiplyAll([
      Transforms.translate(0, 0.7, -1.4),
      Transforms.fromEulerZYX(0, 0, 0),
      Transforms.scale(0.66, 0.66, 0.66)
    ]);

    let tPositions: Vec3[] = [];
    positions.forEach(p => {
      const v = new Vec4(p.x, p.y, p.z, 1);
      const f = Mat4.multiplyVec4(carTransform, v);
      tPositions.push(new Vec3(f.x, f.y, f.z));
    })
    const carBounds = Shapes.Box.fromPoints(tPositions);

    const materials = parseMTL(carMTL);


    let carTriangles: Shapes.Triangle[] = [];
    triangles.forEach(tri => {
      const p1 = tPositions[tri.corners[0]!.p]!;
      const p2 = tPositions[tri.corners[1]!.p]!;
      const p3 = tPositions[tri.corners[2]!.p]!;

      const shape = new Shapes.Triangle([p1, p2, p3]);
      const mat = materials[tri.material!]!;
      const kd = mat.Kd;
      const ks = mat.Ks;
      shape.kd = () => { return mat.Kd; };
      shape.ks = () => { return ks; };
      shape.ns = mat.Ns;
      shape.rho = 3.0 * ks.x;

      carTriangles.push(shape);
    });

    // ------------------ SCENE

    const scene = [room, mirror, boxspring, mattress, silverBall, redBall];
    // Quick and dirty set all specular highlights to white as per spec
    scene.forEach(shape => {
      shape.ks = () => { return new Vec3(1); }
    });

    function sceneHit(ray: Ray, t0: number, t1: number): HitRecord | undefined {
      let closest: HitRecord | undefined;

      const sceneObjects = state.useCarBounds ? [...scene, carBounds] : [...scene, ...carTriangles];
      for (const surf of sceneObjects) {
        state.raysTraced++;
        const rec = surf.hit(ray, t0, t1);
        if (rec)
        {
          let hit = Array.isArray(rec) ? rec[0] : rec;
          if (hit?.shape === carBounds) {
            hit = meshHit(ray, t0, t1, carTriangles);
          }
          if (!hit)
            continue;
          if (!closest || hit.t < closest.t) {
            closest = hit;
            t1 = closest!.t;
          }
        }
      }
      return closest;
    }

    function meshHit(ray: Ray, t0: number, t1: number, tris: Shapes.Triangle[]): HitRecord | undefined {
      let closest: HitRecord | undefined;
      for (const surf of tris) {
        state.triangleTests++;
        const rec = surf.hit(ray, t0, t1);
        if (rec)
        {
          const hit = Array.isArray(rec) ? rec[0]! : rec;
          if (!closest || hit.t < closest.t) {
            closest = hit;
            t1 = closest!.t;
          }
        }
      }
      return closest;
    }

    // ---------- Shading ----------
    const lightPos = new Vec3(-1, 3.2, 2.4);
    const alpha = 0.15; // ambient fraction
    const eps = 1e-4, delta = 1e-3;

    function shadeRay(ray: Ray, t0: number, t1: number, depth: number = 0): Vec3 {
      const rec = sceneHit(ray, t0, t1);
      if (!rec)
        return Vec3.add(ray.origin, ray.direction.scale(1000)).y <= 0 ? background2 : background;
      // console.log("Hit: " + rec.shape!.constructor.name);

      const x = rec.position;
      const d = ray.direction;
      const n = Vec3.dot(rec.normal, d) > 0 ? rec.normal.negate().normalize() : rec.normal.normalize();
      // const ka = rec.shape!.ka(x, n); // Unused for now
      const kd = rec.shape!.kd(x, n);
      const ks = rec.shape!.ks(x, n);
      const ns = rec.shape!.ns;

      const l = Vec3.sub(lightPos, x);
      const ln = l.normalize();
      const r = l.length();
      const v = d.normalize().negate();
      const h = Vec3.add(ln, v).normalize();

      const shadowRay = new Ray(Vec3.add(rec.position!, n!.scale(delta)), ln);
      const inShadow = (sceneHit(shadowRay, eps, r)?.t ?? Infinity) < r;

      // c = kd (alpha + (1 - alpha) max(0, n·l)) + ks max(0, n·h)^p
      let c = kd.scale(alpha).clamp(0, 1);
      if (!inShadow && Vec3.dot(n, ln) > 0) {
        const spec = ks.scale(Math.max(0, Vec3.dot(n, h)) ** ns);
        c = Vec3.add(kd.scale(alpha + (1 - alpha) * Vec3.dot(n, l)), spec);
      }

      // Mirror: r = d - 2(d·n)n, blended as c = (1 - rho) c + rho c_reflected
      const rho = rec.shape!.rho;
      if (rho > 0 && depth < state.maxDepth) {
          const rdir = Vec3.sub(d, n.scale(2 * Vec3.dot(d, n)));
          const mirrorRay = new Ray(Vec3.add(x, n.scale(delta)), rdir);
          c = Vec3.add(
            c.scale(1 - rho),
            shadeRay(mirrorRay, eps, Infinity, depth+1).scale(rho)
          );
        }

      return c.clamp(0, 1);
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
    const target = new Vec3(0, 0.9, -1);
    const up = new Vec3(0, 1, 0);
    const fovy = deg2rad(45);
    let w: Vec3;
    let u: Vec3;
    let v: Vec3;
    const restart = () => {
      pixels = new Uint8Array(canvas.width * canvas.height * 4); // RGBA, row 0 at the top
      nx = Math.floor(canvas.width * state.resolutionScale / 64) * 64;  // Divide by 64 to get correct alignment
      ny = Math.floor(canvas.height * state.resolutionScale);
      cursor = 0;
      state.raysTraced = 0;
      state.triangleTests = 0;

      // ---------- Camera ----------
      const y = deg2rad(state.yaw);
      const p = deg2rad(state.pitch);

      e = Vec3.add(target,
        new Vec3(
        Math.cos(p)*Math.sin(y),
        Math.sin(p),
        Math.cos(p)*Math.cos(y)).normalize().scale(state.distance));
      console.log(`Camera pos: ${e}`)

      const testRay = new Ray(e, Vec3.sub(new Vec3(2.2, 0.4, -0.9), e).normalize());
      console.log('red ball hit:', sceneHit(testRay, 0, Infinity)?.shape?.constructor.name);

      const centerD = Vec3.sub(target, e).normalize();
      const centerHit = sceneHit(new Ray(e, centerD), 0, Infinity);
      console.log('center hit:', centerHit?.shape?.constructor.name, centerHit?.t);

      w = Vec3.sub(target, e).negate().normalize();
      u = Vec3.cross(up, w).normalize();
      v = Vec3.cross(w, u).normalize();

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
    let pendingRestart = false;
    const controllerTriggers = [...guiRender.controllers, ...guiCamera.controllers];
    controllerTriggers.forEach((control) => {
      control.onFinishChange( () => {
        pendingRestart = true;
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
        if (pendingRestart) {
          restart();
          pendingRestart = false;
        }

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
        while (performance.now() - startTrace < 0.12 && cursor < nx * ny) {
          if (x >= nx) {
            x = 0;
            y++;
          }
          tracePixel(x++, y);
          //
          cursor++;
        }
        state.progress = `${(cursor / (nx * ny)).toFixed(2)}%`;

        device.queue.writeTexture({ texture }, pixels, { bytesPerRow: nx * 4 }, [nx, ny]);
      });
  } catch (error) {
    console.error("WebGPU Initialization Error:", error);
    const statusElem = document.getElementById("status");
    if (statusElem && error instanceof Error)
      statusElem.textContent = "WebGPU Initialization Error:\n" + error.message;
  }
}

window.addEventListener('DOMContentLoaded', init);
