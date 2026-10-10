
import * as Vec3 from "@/lib/math/vec3";

type vec3 = [number, number, number];
const normalizeVec3 = Vec3.normalize as (a: vec3) => vec3;
const crossVec3 = Vec3.cross as (a: vec3, b: vec3) => vec3;
const subVec3 = Vec3.sub as (a: vec3, b: vec3) => vec3;


export const VERTS_TETRAHEDRON: vec3[] = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1]
];

function midpoint(A: vec3, B: vec3): vec3 {
  if (A.length !== 3 || A.length !== B.length)
    throw new Error("Midpoint: Expected two vec3 values.");

  let points: number[] = [];
  for (let i = 0; i < A.length; i++) {
    const sum = A[i]! + B[i]!;
    points.push(sum/2);
  }

  return [
    (A[0] + B[0])/2,
    (A[1] + B[1])/2,
    (A[2] + B[2])/2,
    ];
}

/**
 * Creates the faces for a tetrahedron, given the main 4 vertices.
 * Returns a `Float32Array` in the format of position and normals in X Y Z.
 * @param _vertices
 */
export function makeTetrahedron(_vertices: vec3[] = VERTS_TETRAHEDRON): vec3[] {
  // Faces: 012 031 023 123
  return [
    ...makeFace([_vertices[0]!, _vertices[1]!, _vertices[2]!]),
    ...makeFace([_vertices[0]!, _vertices[3]!, _vertices[1]!]),
    ...makeFace([_vertices[0]!, _vertices[2]!, _vertices[3]!]),
    ...makeFace([_vertices[1]!, _vertices[3]!, _vertices[2]!]),
  ];
}

function makeFace(_vertices: vec3[]) {
  const n: vec3 = normalizeVec3(crossVec3(
    subVec3(_vertices[1]!, _vertices[0]!),
    subVec3(_vertices[2]!, _vertices[0]!)))

  const [a, b, c] = _vertices as [vec3, vec3, vec3];
  return [
    a, n,
    b, n,
    c, n,
  ];
}

function subdivideTetrahedron(_vertices: vec3[], depth: number = 0) : vec3[] {
  if (depth <= 0)
    return _vertices;

  const [v0, v1, v2, v3] = _vertices;
  const m01 = midpoint(v0!, v1!);
  const m02 = midpoint(v0!, v2!);
  const m03 = midpoint(v0!, v3!);
  const m12 = midpoint(v1!, v2!);
  const m13 = midpoint(v1!, v3!);
  const m23 = midpoint(v2!, v3!);

  return [
    ...subdivideTetrahedron([v0!, m01, m02, m03], depth - 1),
    ...subdivideTetrahedron([v1!, m01, m13, m12], depth - 1),
    ...subdivideTetrahedron([v2!, m02, m12, m23], depth - 1),
    ...subdivideTetrahedron([v3!, m03, m23, m13], depth - 1),
  ];
}

export function generateGasket(depth: number = 0) : vec3[] {
  if (depth <= 0)
    return makeTetrahedron();

  let vertices: vec3[] = [];

  let boxes = subdivideTetrahedron(VERTS_TETRAHEDRON, depth);
  for (let i = 0; i < boxes.length / 4; i++) {
    const _verts = boxes.slice(i*4, (i*4)+4) as vec3[];
    vertices.push(...makeTetrahedron(_verts));
  }

  return vertices;
}
