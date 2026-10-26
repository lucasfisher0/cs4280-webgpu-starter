import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import * as JSGeometry from "@/lib/webgpu/geometry";
import {Mesh} from "@/core/render/Mesh.ts";
import {createBuffer} from "@/lib/webgpu/buffers";

interface JSIndexedMesh {
  positions: Float32Array,
  normals: Float32Array,
  uvs: Float32Array,
  indices: Uint16Array,
  vertexCount: number,
  indexCount: number,
}
export type {JSIndexedMesh};

/** Interleaves position, normal, and uv for the expected shader format. */
function interleaveVertexData(positions: Vec3[], normals: Vec3[], uvs: Vec2[]): Float32Array {
  if (positions.length != normals.length || positions.length != uvs.length) {
    console.warn("interleaveVertexData: Mesh had a mismatching number of positions, normals, and uvs.");
  }

  let dat: number[] = [];
  for (let i = 0; i < positions.length; i++) {
    dat.push(...positions[i]!.toArray());
    dat.push(...normals[i]!.toArray());
    // dat.push(...uvs[i]!.toArray());
  }
  return new Float32Array(dat);
}

export class IndexedMesh extends Mesh {
  positions: Vec3[];
  normals: Vec3[];
  uvs: Vec2[];
  indices: number[];
  vertexCount: number;
  indexCount: number;
  indexFormat: GPUIndexFormat;

  constructor(device: GPUDevice, positions: Vec3[], normals: Vec3[], uvs: Vec2[], indices: number[], label?: string) {
    // Mesh setup, requires initialization of buffers before accessing instance members
    let vertexData: Float32Array = interleaveVertexData(positions, normals, uvs);
    let vertexBuffer = createBuffer(device, vertexData, GPUBufferUsage.VERTEX, label);
    let indexBuffer = createBuffer(device, new Uint16Array(indices), GPUBufferUsage.INDEX, label);
    super(vertexBuffer, indexBuffer);

    this.positions = positions;
    this.normals = normals;
    this.uvs = uvs;
    this.indices = indices;
    this.vertexCount = positions.length;
    this.indexCount = indices.length;
    this.indexFormat = indices instanceof Uint32Array ? 'uint32' : 'uint16';
  }

  // Creates a native mesh from the provided `JSIndexedMesh` format.
  static fromArray(device: GPUDevice, mesh: JSIndexedMesh) {
    let positions: Vec3[] = Vec3.fromList(mesh.positions);
    let normals: Vec3[] = Vec3.fromList(mesh.normals);
    let uvs: Vec2[] = Vec2.fromList(mesh.uvs);

    return new IndexedMesh(device, positions, normals, uvs, [...mesh.indices]);
  }

  invertNormals() {
    this.normals = this.normals.map((vec: Vec3) => vec.negate());
  }

  override draw(pass: GPURenderPassEncoder, slot: number = 0)
  {
    pass.setVertexBuffer(slot, this.vertexBuffer);
    pass.setIndexBuffer(this.indexBuffer, this.indexFormat);
    pass.drawIndexed(this.indexCount);
  }
}

export function createCubeGeometry(device: GPUDevice, size: number = 1) {
  return IndexedMesh.fromArray(device, JSGeometry.createCubeGeometry(size) as JSIndexedMesh);
}

export function createSphereGeometry(device: GPUDevice, radius: number = 1, latitudeBands: number = 24, longitudeBands: number = 24) {
  return IndexedMesh.fromArray(device, JSGeometry.createSphereGeometry(radius, latitudeBands, longitudeBands) as JSIndexedMesh);
}
