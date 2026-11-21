import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts";
import {Mesh} from "@/core/render/Mesh.ts";
import {createBuffer} from "@/lib/webgpu/buffers";
import {DEFAULT_MATERIAL, parseMTL, parseOBJ, type WavefrontMaterial} from "@/core/assets/Wavefront.ts";

export class WavefrontMesh extends Mesh {
  materials: Record<string, WavefrontMaterial> = {};
  materialIndices: Record<number, string> = {};

  constructor(vertexBuffer: GPUBuffer, indexBuffer?: GPUBuffer, materials?: Record<string, WavefrontMaterial>, materialIndices?: Record<number, string>) {
    super(vertexBuffer, indexBuffer);
    this.materials = materials ?? {"default": DEFAULT_MATERIAL};
    this.materialIndices = materialIndices ?? {0: "default"};
  }

  static async fromFile(device: GPUDevice,path: URL) {
    // const path = new URL('/a5/car.obj', import.meta.url);

    const file = await fetch(path);
    const fileStr = await file.text();

    let { positions, texcoords, normals, triangles, materialLibraries } = parseOBJ(fileStr);

    let vertexData: number[] = [];
    let materialIndices: Record<number, string> = {};
    let currentMaterial: string | null = null;
    for (const [i, t] of triangles.entries()) {
      if (t.material != currentMaterial) {
        currentMaterial = t.material ?? "default";
        materialIndices[i] = currentMaterial;
      }

      t.corners.forEach((corner) => {
        vertexData.push(...[...positions[corner.p]!.toArray(), 0]); // Size 12, stride 16
        vertexData.push(...[...normals[corner.n!]!.toArray(), 0]);  // Size 12, stride 16
        vertexData.push(...texcoords[corner.t!]!.toArray());        // Size 8, stride 8
      });
    }

    let materials: Record<string, WavefrontMaterial> = {};
    for (const mFileName of materialLibraries) {
      const mPath = new URL(`/${mFileName}.mtl`, path.pathname)
      const mFile = await fetch(mPath);
      const mStr = await mFile.text();
      materials = {...materials, ...parseMTL(mStr)};
    }

    const vertexBuffer = createBuffer(device, new Float32Array(vertexData), GPUBufferUsage.VERTEX);
    return new WavefrontMesh(vertexBuffer, undefined, materials, materialIndices);
  }

  override draw(queue: GPUQueue, pass: GPURenderPassEncoder, slot: number = 0)
  {
    const UNIFORM_SIZE = 88;
    const uniformData = new ArrayBuffer(UNIFORM_SIZE);
    const f32 = new Float32Array(uniformData);
    const u32 = new Uint32Array(uniformData);



    const mvp = Mat4.Identity();
    const normal = Mat4.Identity();


    // pass.setPipeline()
    // pass.setBindGroup()
    pass.setVertexBuffer(slot, this.vertexBuffer);

    const setMaterial = (name: string) => {
      const hasDiffuseTexture = this.materials[name]!.maps[name] instanceof GPUTexture;
      f32.set(this.materials[name]!.Ka.toArray(), 32);
      f32.set([...this.materials[name]!.Kd.toArray(), Number(hasDiffuseTexture)], 48);
      f32.set(this.materials[name]!.Ks.toArray(), 64);
      f32.set([this.materials[name]!.Ns], 80);
      f32.set([1], 84); // Opacity, currently unused

      if (hasDiffuseTexture) {
        const tex = this.materials[name]!.maps[name]! as GPUTexture;
        queue.writeTexture()
      }
    }

    const FLOATS_PER_VERTEX = 4 + 4 + 2;
    const LENGTH = this.vertexBuffer.size / (FLOATS_PER_VERTEX * 4);
    const PREVIOUS = 0;
    for (let i = 0; i < LENGTH; i++) {
      const newMaterial = this.materialIndices[i];
      if (newMaterial != undefined) {
        setMaterial(newMaterial);
        if (i != PREVIOUS)
          pass.draw(i - PREVIOUS, undefined, PREVIOUS);
      }
    }
    pass.draw(LENGTH - PREVIOUS, undefined, PREVIOUS);
  }

}
