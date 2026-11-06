import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts";


/**
 * Wavefront material matching the Material Template Library format. Represents a standard Phong shading model,
 * however will be interpreted as Blinn-Phong by using the shininess `Ns` with the halfway vector.
 *
 * @Ka - Ambient color (RGB)
 * @Kd - Diffuse color (RGB)
 * @Ks - Specular color (RGB)
 * @Ns - Shininess Coefficient
 * @d - Dissolve (opacity), also controlled by `Tr`, which is transparency (reversed values)
 * @map_Kd - Path to diffuse texture file
 */
interface WavefrontMaterial {
  Ka: Vec3;
  Kd: Vec3;
  Ks: Vec3;
  Ns: number;
  d: number;
  map_Kd: string | null; // Technically supports map_ for other files, but that's for another time.
}

/** The material used for faces with no `usemtl`, or a name the MTL file lacks. */
export const DEFAULT_MATERIAL: WavefrontMaterial = Object.freeze({
  Ka: Object.freeze(Vec3.Zero()),
  Kd: Object.freeze(new Vec3(0.8, 0.8, 0.8)),
  Ks: Object.freeze(Vec3.Zero()),
  Ns: 0,
  d: 1,
  map_Kd: null,
});

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

enum MTL_TOKEN {
  AMBIENT = "Ka",
  DIFFUSE = "Kd",
  SPECULAR = "Ks",
  SHININESS = "Ns",
  DISSOLVE = "d",
  TRANSPARENCY = "Tr",
  TEXTURE_DIFFUSE = "map_Kd"
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

type Corner = {
  p: number;
  n: number | null;
  t: number | null;
};

type Triangle = {
  corners: Corner[];
  material: string | null;
}

const isToken = (tag: string | undefined, token: OBJ_TOKEN | MTL_TOKEN): boolean => (tag == token);

export function fromString(text: string, computeNormals: boolean = true) {
  const positions: Vec3[] = [];
  const normals: Vec3[] = [];
  const texcoords: Vec2[] = [];

  const triangles: Triangle[] = [];
  const materialLibraries: string[] = [];
  let material = null;

  // 1-based, or negative to count back from the most recent record.
  const resolve = (index: number, count: number): number => (index < 0 ? count + index : index - 1);

  for (const line of text.split(/\r?\n/)) {
    const [tag, ...values] = line.trim().split(/\s+/).map(str => str.toLowerCase());
    if (!tag || isToken(tag, OBJ_TOKEN.COMMENT))
      continue;
    if (isToken(tag, OBJ_TOKEN.SET_OBJECT))
      console.warn("Wavefront objects are not yet implemented. Skipping...");
    else if (isToken(tag, OBJ_TOKEN.MATERIAL_FILE))
      materialLibraries.push(values.join(" "));
    else if (isToken(tag, OBJ_TOKEN.MATERIAL))
      material = values.join(" ");
    else if (isToken(tag, OBJ_TOKEN.VERTEX))
      positions.push(parseVec3(values));
    else if (isToken(tag, OBJ_TOKEN.NORMAL))
      normals.push(parseVec3(values));
    else if (isToken(tag, OBJ_TOKEN.UV))
      texcoords.push(parseVec2(values));
    else if (isToken(tag, OBJ_TOKEN.SMOOTH_GROUP))
      console.warn("Smoothing groups are not yet implemented. Skipping...");
    else if (isToken(tag, OBJ_TOKEN.FACE)) {
      if (values.length < 3) {
        console.warn("Non-triangle faces are not yet supported. Skipping face...");
        continue;
      }
      const corners = values.map((corner): Corner => {
        const [p, t, n] = corner.split("/");
        return {
          p: resolve(Number(p), positions.length),
          t: t ? resolve(Number(t), texcoords.length) : null,
          n: n ? resolve(Number(n), normals.length) : null,
        };
      });
      if (computeNormals && corners.some((corner) => corner.n === null)) {
        normals.push(faceNormal(corners.map((corner) => positions[corner.p] as Vec3)));
        for (const corner of corners) corner.n ??= normals.length - 1;
      }
      for (let i = 1; i + 1 < corners.length; i++) {
        triangles.push({ corners: [corners[0]!, corners[i]!, corners[i + 1]!], material });
      }
    }
  }

  return { positions, texcoords, normals, triangles, materialLibraries };
}

/**
 * Parses MTL text into `{ name: { Ka, Kd, Ks, Ns, d, map_Kd } }`. Missing
 * keys take their values from DEFAULT_MATERIAL. `Tr` is read as `1 − d`, and
 * `map_Kd` keeps only its last word (the file name, after any options).
 */
export function parseMTL(text: string) {
  const materials: Record<string, WavefrontMaterial> = {};
  let current: WavefrontMaterial | null = null;
  for (const line of text.split(/\r?\n/)) {
    const [tag, ...values] = line.trim().split(/\s+/);
    if (isToken(tag, OBJ_TOKEN.MATERIAL)) {
      const { Ka, Kd, Ks } = DEFAULT_MATERIAL;
      current = { ...DEFAULT_MATERIAL, Ka: Ka, Kd: Kd, Ks: Ks };
      materials[values.join(" ")] = current;
      continue;
    }
    if (!current)
      continue;
    if (isToken(tag, MTL_TOKEN.AMBIENT))
      current.Ka = parseVec3(values);
    else if (isToken(tag, MTL_TOKEN.DIFFUSE))
      current.Kd = parseVec3(values);
    else if (isToken(tag, MTL_TOKEN.SPECULAR))
      current.Ks = parseVec3(values);
    else if (isToken(tag, MTL_TOKEN.SHININESS))
      current.Ns = Number(values[0]);
    else if (isToken(tag, MTL_TOKEN.DISSOLVE))
      current.d = Number(values[0]);
    else if (isToken(tag, MTL_TOKEN.TRANSPARENCY))
      current.d = 1 - Number(values[0]);
    else if (isToken(tag, MTL_TOKEN.TEXTURE_DIFFUSE))
      current.map_Kd = values.at(-1) ?? null;
  }
  return materials;
}

/** A polygon's unit normal by Newell's method, which also handles non-planar n-gons. */
function faceNormal(points: Vec3[]): Vec3 {
  const normal: Vec3 = Vec3.Zero();
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length] as Vec3;
    normal.x += (a.y - b.y) * (a.z + b.z);
    normal.y += (a.z - b.z) * (a.x + b.x);
    normal.z += (a.x - b.x) * (a.y + b.y);
  });
  const length = normal.length();
  return length > 0 ? normal.normalize() : new Vec3(0, 1, 0); // degenerate face
}
