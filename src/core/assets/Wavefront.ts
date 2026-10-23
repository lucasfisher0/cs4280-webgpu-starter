
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import {IndexedMesh, Vertex} from "@/core/assets/IndexedMesh.ts"

type Polygon = number[];

enum OBJ_TOKEN {
  COMMENT = "#",
  SET_OBJECT = "o",
  VERTEX = "v",
  NORMAL = "vn",
  UV = "vt",
  FACE = "f",
  SMOOTH_GROUP = "s",
  MATERIAL_FILE = "mtllib",
  MATERIAL = "usemtl",
}

function parseVec2(str: string[]): Vec2 {
  let f1 = parseFloat(str[0]!);
  let f2 = parseFloat(str[1]!);
  return new Vec2(f1, f2);
}

function parseVec3(str: string[]): Vec3 {
  let f1 = parseFloat(str[0]!);
  let f2 = parseFloat(str[1]!);
  let f3 = parseFloat(str[2]!);
  return new Vec3(f1, f2, f3);
}

export class WavefrontMeshBuilder {

  /*
    Builds an indexed mesh from a Wavefront .obj file, provided as a string.
  */
  static fromString(str: string) {

    let positions: Vec3[] = [];
    let normals: Vec3[] = [];
    let texCoords: Vec2[] = [];

    let vertices: Vertex[] = [];
    let verticesBuilt: boolean = false;
    let faces: Polygon[] = []; // Each face is a list of vertex indices


    const lines: string[] = str.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {

      const args = lines[i]!.split(/\s/);
      if (args[0] === null || args[0] === undefined || args[0].toLowerCase() == OBJ_TOKEN.COMMENT)
        continue;

      if (args[0].toLowerCase() == OBJ_TOKEN.SET_OBJECT)
      {
        console.warn("Wavefront objects are not yet implemented. Skipping...");
        continue;
      }

      if (args[0].toLowerCase() == OBJ_TOKEN.VERTEX)
        positions.push(parseVec3(args.slice(1)));

      if (args[0].toLowerCase() == OBJ_TOKEN.NORMAL)
        normals.push(parseVec3(args.slice(1)));

      if (args[0].toLowerCase() == OBJ_TOKEN.UV)
        texCoords.push(parseVec2(args.slice(1)));

      if (args[0].toLowerCase() == OBJ_TOKEN.FACE)
      {
        if (!verticesBuilt) {
          for (let j = 0; j < positions.length; j++) {
            vertices.push(new Vertex(positions[j]!, normals[j], texCoords[j]));
          }
          verticesBuilt = true;
        }

        for (const faceStr of args.slice(1)) {
          let poly: Polygon = faceStr.split(/\//).map((val: string) => parseInt(val));
          // TODO: Edge detection here, save for later assignments
          faces.push(poly);
        }
      }

      if (args[0].toLowerCase() == OBJ_TOKEN.SMOOTH_GROUP)
      {
        console.warn("Smoothing groups are not yet implemented. Skipping...");
        continue;
      }
    }
  }
}
