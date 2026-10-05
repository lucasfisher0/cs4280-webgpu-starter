
import * as Vec3 from "@/lib/math/vec3";

type vec3 = [number, number, number];


const VERTS_TETRAHEDRON: vec3[] = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1]
];

function midpoint(A: vec3, B: vec3): vec3[] {
  if (A.length !== 3 || A.length !== B.length)
    throw new Error("Midpoint: Expected two vec3 values.");

  let points: number[] = [];
  for (let i = 0; i < A.length; i++) {
    const sum = A[i]! + B[i]!;
    points.push(sum/2);
  }

  return [
    [points[0]!, points[1]!, points[2]!],
    [points[3]!, points[4]!, points[5]!],
    [points[6]!, points[7]!, points[8]!],
  ];
}

/**
 * Creates the faces for a tetrahedron, given the main 4 vertices.
 * Returns a `Float32Array` in the format of position and normals in X Y Z.
 * @param _vertices
 */
export function makeTetrahedron(_vertices: vec3[] = VERTS_TETRAHEDRON): Float32Array {
  // Faces: 012 023 321 310
  // Normal format: normalize( (v1-v0) x (v2-v0))
  return new Float32Array([
    ..._vertices[0]!, ..._vertices[1]!, ..._vertices[2]!, ...Vec3.normalize(Vec3.cross(Vec3.sub(_vertices[1], _vertices[0]), Vec3.sub(_vertices[2], _vertices[0]))),
    ..._vertices[0]!, ..._vertices[2]!, ..._vertices[3]!, ...Vec3.normalize(Vec3.cross(Vec3.sub(_vertices[2], _vertices[0]), Vec3.sub(_vertices[3], _vertices[0]))),
    ..._vertices[3]!, ..._vertices[2]!, ..._vertices[1]!, ...Vec3.normalize(Vec3.cross(Vec3.sub(_vertices[2], _vertices[3]), Vec3.sub(_vertices[1], _vertices[3]))),
    ..._vertices[3]!, ..._vertices[1]!, ..._vertices[0]!, ...Vec3.normalize(Vec3.cross(Vec3.sub(_vertices[1], _vertices[3]), Vec3.sub(_vertices[0], _vertices[3]))),
  ]);
}

export function subdivideTetrahedron(_vertices: vec3[] = VERTS_TETRAHEDRON, depth: number = 0) {
  if (depth <= 0)
    return _vertices;

  return _vertices;

  /*
  const midpoints = [
    midpoint(_vertices[0], _vertices[1]),
    midpoint(_vertices[0], _vertices[2]),
    midpoint(_vertices[0], _vertices[3]),
    midpoint(_vertices[1], _vertices[2]),
    midpoint(_vertices[1], _vertices[3]),
    midpoint(_vertices[2], _vertices[3]),
  ];

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
