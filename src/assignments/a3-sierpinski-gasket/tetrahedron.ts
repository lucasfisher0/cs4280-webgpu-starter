
import * as Vec3 from "@/lib/math/vec3";

const VERTS_TETRAHEDRON: number[][] = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1]
];

function midpoint(A: number[], B: number[]): number[] {
  if (A.length !== B.length)
    throw new Error("Midpoint: given mismatched sizes.");

  let point = [];
  for (let i = 0; i < A.length; i++) {
    const sum = A[i] + B[i];
    point.push(sum/2);
  }

  return point;
}

/**
 * Creates the faces for a tetrahedron, given the main 4 vertices.
 * Returns a `Float32Array` in the format of position and normals in X Y Z.
 * @param _vertices
 */
export function makeTetrahedron(_vertices: number[][] = VERTS_TETRAHEDRON): Float32Array {
  // Faces: 012 023 321 310
  // Normal format: normalize( (v1-v0) x (v2-v0))
  return new Float32Array([
    ..._vertices[0], ..._vertices[1], ..._vertices[2], ...Vec3.normalize(Vec3.cross(Vec3.sub(_vertices[1], _vertices[0]), Vec3.sub(_vertices[2], _vertices[0]))),
    ..._vertices[0], ..._vertices[2], ..._vertices[3], ...Vec3.normalize(Vec3.cross(Vec3.sub(_vertices[2], _vertices[0]), Vec3.sub(_vertices[3], _vertices[0]))),
    ..._vertices[3], ..._vertices[2], ..._vertices[1], ...Vec3.normalize(Vec3.cross(Vec3.sub(_vertices[2], _vertices[3]), Vec3.sub(_vertices[1], _vertices[3]))),
    ..._vertices[3], ..._vertices[1], ..._vertices[0], ...Vec3.normalize(Vec3.cross(Vec3.sub(_vertices[1], _vertices[3]), Vec3.sub(_vertices[0], _vertices[3]))),
  ]);
}

export function subdivideTetrahedron(_vertices: number[][] = VERTS_TETRAHEDRON, depth: number = 0) {
  if (depth <= 0)
    return _vertices;

  const midpoints = [
    midpoint(_vertices[0], _vertices[1]),
    midpoint(_vertices[0], _vertices[2]),
    midpoint(_vertices[0], _vertices[3]),
    midpoint(_vertices[1], _vertices[2]),
    midpoint(_vertices[1], _vertices[3]),
    midpoint(_vertices[2], _vertices[3]),
  ];

  return _vertices;

  /*

  let vertices: number[][] = [];
  for (let i = 0; i < _vertices.length; i++) {
    const tetrahedron = [..._vertices];
    for (let j = 0; j < _vertices.length-1; j++) {


    }
    //vertices.push(subdivide(tetrahedron, depth-1));
  }


  let tetrahedron = [
    midpoint(_vertices[0], _vertices[2]),
    _vertices[2],
    midpoint(_vertices[2], _vertices[3]),
  ];



  M02,2, M23

   */
}
