
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
  // Faces: 012 023 321 310
  // Normal format: normalize( (v1-v0) x (v2-v0))
  return [
    _vertices[0]!, _vertices[1]!, _vertices[2]!, normalizeVec3(crossVec3(subVec3(_vertices[1]!, _vertices[0]!), subVec3(_vertices[2]!, _vertices[0]!))),
    _vertices[0]!, _vertices[2]!, _vertices[3]!, normalizeVec3(crossVec3(subVec3(_vertices[2]!, _vertices[0]!), subVec3(_vertices[3]!, _vertices[0]!))),
    _vertices[3]!, _vertices[2]!, _vertices[1]!, normalizeVec3(crossVec3(subVec3(_vertices[2]!, _vertices[3]!), subVec3(_vertices[1]!, _vertices[3]!))),
    _vertices[3]!, _vertices[1]!, _vertices[0]!, normalizeVec3(crossVec3(subVec3(_vertices[1]!, _vertices[3]!), subVec3(_vertices[0]!, _vertices[3]!))),
  ];
}

export function subdivideTetrahedron(_vertices: vec3[] = VERTS_TETRAHEDRON, depth: number = 0) : vec3[] {
  if (depth <= 0)
    return _vertices;

  //return _vertices;

  // function midpoint(A: vec3, B: vec3): vec3[]
  const midpoints = [
    midpoint(_vertices[0]!, _vertices[1]!),
    midpoint(_vertices[0]!, _vertices[2]!),
    midpoint(_vertices[0]!, _vertices[3]!),
    midpoint(_vertices[1]!, _vertices[2]!),
    midpoint(_vertices[1]!, _vertices[3]!),
    midpoint(_vertices[2]!, _vertices[3]!),
  ];

  let vertices: vec3[] = [];
  // 012
  vertices.push(...subdivideTetrahedron(makeTetrahedron([_vertices[0]!, midpoints[0]!, midpoints[1]!]), depth-1));
  // 023
  vertices.push(...subdivideTetrahedron(makeTetrahedron([_vertices[0]!, midpoints[1]!, midpoints[2]!]), depth-1));
  // 321
  vertices.push(...subdivideTetrahedron(makeTetrahedron([_vertices[3]!, midpoints[5]!, midpoints[4]!]), depth-1));
  // 310
  vertices.push(...subdivideTetrahedron(makeTetrahedron([_vertices[3]!, midpoints[4]!, midpoints[2]!]), depth-1));
  return vertices;
}
