import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"
import {Ray, HitRecord} from "@/core/raytracing/Ray.ts";

export type BoundingBox = {
  min: Vec3;
  max: Vec3;
}

type Vec3Indices = 0 | 1 | 2;

/** Creates a bounding box for a point with a given width, and optional height and length. **/
export function makeBoxFromPoint(p: Vec3, width: number, height?: number, length?: number) {
  const w = width;
  const h = height ?? width;
  const l = length ?? height ?? width;

  return {
    min: new Vec3(
      p.x - w,
      p.y - h,
      p.z - l),
    max: new Vec3(
      p.x + w,
      p.y + h,
      p.z + l),
  };
}

/** Returns a bounding box for a given set of points. **/
export function getBounds(p: Vec3[]): BoundingBox {
  let out = {min: new Vec3(Infinity), max: new Vec3(-Infinity)};
  p.forEach(v => {
    // Minimum
    out.min.x = Math.min(out.min.x, v.x);
    out.min.y = Math.min(out.min.y, v.y);
    out.min.z = Math.min(out.min.z, v.z);

    // Maximum
    out.max.x = Math.max(out.max.x, v.x);
    out.max.y = Math.max(out.max.y, v.y);
    out.max.z = Math.max(out.max.z, v.z);
  });
  return out;
}

// Quick accessor for v.x, v.y, v.z in an iterator without having to convert to array
interface AxisAccessor {
  name: "x" | "y" | "z";
  get: (v: Vec3) => number;
  set: (v: Vec3, n: number) => void;
}

const AXES: readonly AxisAccessor[] = [
  { name: "x", get: v => v.x, set: (v, n) => { v.x = n; } },
  { name: "y", get: v => v.y, set: (v, n) => { v.y = n; } },
  { name: "z", get: v => v.z, set: (v, n) => { v.z = n; } },
];

export interface Shape {
  getBounds(): Box;
  hit(ray: Ray, t0: number, t1: number): HitRecord | null;
}

class Box implements Shape {
  private box: BoundingBox;

  get min(): Vec3 {
    return this.box.min;
  }
  set min(val: Vec3) {
    this.box.min = val;
  }
  get max(): Vec3 {
    return this.box.max;
  }
  set max(val: Vec3) {
    this.box.max = val;
  }

  getBounds(): Box {
    return this;
  }
  /** Tests collision between shape and ray. */
  hit(ray: Ray, t0: number, t1: number) {
    const TOLERANCE = 1e-4;
    let min = new Vec3(-Infinity);
    let max = new Vec3(Infinity);

    // Check if ray is inside box
    let insideBox = true;
    for (const axis of AXES) {
      const o = axis.get(ray.origin);
      if (o < axis.get(this.min) || o > axis.get(this.max)) {
        insideBox = false;
        break;
      }
    }

    // Slab-method check
    for (const axis of AXES) {
      const a = 1 / axis.get(ray.direction);

      // If direction is perpendicular on this axis, check if origin lies outside the box
      if (Math.abs(axis.get(ray.direction)) < TOLERANCE) {
        const o = axis.get(ray.origin);
        if (!insideBox || o < axis.get(this.min) || o > axis.get(this.max))
          return null; // If a single axis misses, there is no overlap.
      }

      if (a >= 0) {
        axis.set(min, a * (axis.get(this.min) - axis.get(ray.origin)));
        axis.set(max, a * (axis.get(this.max) - axis.get(ray.origin)));
      }
      else {
        axis.set(max, a * (axis.get(this.min) - axis.get(ray.origin)));
        axis.set(min, a * (axis.get(this.max) - axis.get(ray.origin)));
      }
    }

    const tnear = Math.max(min.x, min.y, min.z);
    const tfar = Math.min(max.x, max.y, max.z);

    const thit = insideBox ? tfar : tnear;
    const tother = insideBox ? tnear : tfar;
    if (thit < tother)
      return null; // No overlap
    if (tother < t0 || thit > t1)
      return null; // outside [t0, t1]
    if (thit < TOLERANCE)
      return null;

    // Compute hit normals
    const position = ray.evaluate(thit);
    let c = Vec3.Zero();
    let h = Vec3.Zero();
    for (const axis of AXES) {
      const pc = (axis.get(this.min) + axis.get(this.max)) / 2;
      axis.set(c, pc);
      const hc = (axis.get(this.max) - axis.get(this.min)) / 2;
      axis.set(h, hc);
    }

    let normal: Vec3 = Vec3.Zero();
    let length = -Infinity;
    for (const axis of AXES) {
      const ka = axis.get(position) - axis.get(c);
      const len = Math.abs(ka) / axis.get(h);

      if (len > length) {
        length = len;
        normal = Vec3.Zero();
        axis.set(normal, Math.sign(ka));
      }
    }

    if (insideBox)
      normal = normal.negate();

    return new HitRecord(this, tnear, position, normal);
  }

  constructor(box: BoundingBox) {
    this.box = box;
  }

  /** Creates a box for a point with a given width, and optional height and length. **/
  static fromPoint(p: Vec3, width: number, height?: number, length?: number) {
    return new Box(makeBoxFromPoint(p, width, height, length));
  }
  /** Creates a box bounding a given set of points. **/
  static fromPoints(p: Vec3[]) {
    return new Box(getBounds(p));
  }
}

type TrianglePoints = [Vec3, Vec3, Vec3];
class Triangle implements Shape {
  #points: TrianglePoints;
  #bounds: Box;

  point(i: Vec3Indices): Vec3 {
    return this.#points[i];
  }
  setPoints(a?: Vec3, b?: Vec3, c?: Vec3) {
    if (a) this.#points[0] = a;
    if (b) this.#points[1] = b;
    if (c) this.#points[2] = c;

    const newBounds = getBounds(this.#points);
    this.#bounds.min = newBounds.min;
    this.#bounds.max = newBounds.max;
  }
  getBounds(): Box {
    return this.#bounds;
  }
  /** Tests collision between shape and ray. */
  hit(ray: Ray, t0: number, t1: number): HitRecord | null {
    return null;


    // @ts-ignore
    let normal = Vec3.triangleNormal(this.#points[0], this.#points[1], this.#points[2]);
    return new HitRecord(this, null, null, normal);
  }

  constructor(points: TrianglePoints) {
    this.#points = points;
    this.#bounds = Box.fromPoints(points);
  }
}

class Sphere implements Shape {
  #origin: Vec3;
  #radius: number;
  #bounds!: Box;

  set origin(v: Vec3) {
    this.#origin = v;
    this.recalculateBounds();
  }
  set radius(r: number) {
    this.#radius = r;
    this.recalculateBounds();
  }

  recalculateBounds() {
    const rad = new Vec3(this.#radius);
    const boundingBox = {
      min: Vec3.sub(this.origin, rad),
      max: Vec3.add(this.origin, rad),
    }

    this.#bounds = new Box(boundingBox);
  }
  getBounds(): Box {
    return this.#bounds;
  }
  /** Tests collision between shape and ray. */
  hit(ray: Ray, t0: number, t1: number): HitRecord | null {
    return null;
  }

  constructor(origin: Vec3, radius: number) {
    this.#origin = origin;
    this.#radius = radius;
    this.recalculateBounds();
  }
}







