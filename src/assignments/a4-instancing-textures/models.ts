
import * as Vec3 from "@/lib/math/vec3";

type vec3 = {
  x: number;
  y: number;
  z: number;
};

function asArray(v: vec3): number[] {
  return [v.x, v.y, v.z];
}

type IndexedVertices = {
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
}

function getInterleaved(data: IndexedVertices): Float32Array {
  if (data.vertices.length !== data.normals.length)
    throw new Error("getInterleaved was given mismatching vertices and normals.");

  var arr: number[] = [];
  for (let i = 0; i < data.vertices.length; i++) {
    const v =  data.vertices[i] as number;
    const n =  data.normals[i] as number;

    arr.push(v);
  }

  return new Float32Array([]);
}





const cubeVertices = [
  {x: -1, y: -1, z: -1},
  {x: 1, y: -1, z: -1},
  {x: 1, y: 1, z: -1},
  {x: -1, y: 1, z: -1},
  {x: -1, y: -1, z: 1},
  {x: 1, y: -1, z: 1},
  {x: 1, y: 1, z: 1},
  {x: -1, y: 1, z: 1}
];

const cubeEdges = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7]
];

export function makeCube() {
  let outVerts: number[] = [];
  let outIndices: number[] = [];

  for (const vert of cubeVertices) {
    outVerts.push(...asArray(vert));
  }
  for (const edge of cubeEdges) {
    if (edge[0] == undefined || edge[1] == undefined)
    {
      continue;
    }

    outVerts.push(...[edge[0], edge[1]]);
  }

  return {
    vertices: new Float32Array(outVerts),
    indices: new Uint16Array(outIndices),
  };
}

export function makeTable() {

}
