
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"

export class Vertex {
  position: Vec3;
  normal: Vec3;
  uv: Vec2;
  edge: number | null;

  constructor(position: Vec3, normal?: Vec3, uv?: Vec2, edge?: number) {
    this.position = position;
    this.normal = normal ?? new Vec3(0, 0, 0);
    this.uv = uv ?? new Vec2(0, 0)
    this.edge = edge ?? null;
  }
}

export class Face {
  vertices: Vertex[];

  constructor() {
    this.vertices = [];
  }
}

export type triangle = {
  v0: number;
  v1: number;
  v2: number;
}

/*
export type edge = {
  start: vertex;
  end: vertex;
  left: face;
  right: face;
  lnext: edge;
  lprev: edge;
  rnext: edge;
  rprev: edge;
}
*/

export class IndexedMesh {
  vertices: Vertex[] = [];
  triangles: triangle[] = [];
}



/*
export class Mesh {
  #vertices: vertex[] = [];
  #faces: face[] = [];
  #edges: edge[] = [];

  fromIndexed() {





  }

  getInterleavedVertices() {

  }

  getVertexIndices() {

  }







}
*/
