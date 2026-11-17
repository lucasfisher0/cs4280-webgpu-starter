import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"

import {type IRay} from "@/core/raytracing/Ray.ts";

// TODO: more complete collisions, (spheres and other primitives?)

type BoundingBox = {
  min: Vec3;
  max: Vec3;
}
export type {BoundingBox};

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

const TOLERANCE = 1e-8;

/** Tests whether bounding box contains the given ray. */
export function testRay(ray: IRay, length: number, box: BoundingBox): boolean {
  // Convert all Vec3 here to arrays for easy iteration on each individual axis
  const origin = ray.origin.toArray();
  const dir = ray.direction.toArray();
  const min = box.min.toArray();
  const max = box.max.toArray();

  let tMin = 0;         // t-value of entry
  let tMax = length;    // t-value of exit
  for (let i = 0; i < 3; i++) {
    const o = origin[i]!;
    const d = dir[i]!;
    const lo = min[i]!;
    const hi = max[i]!;

    // If direction is perpendicular on this axis, check if origin lies outside the box
    if (Math.abs(d) < TOLERANCE) {
      if (o < lo || o > hi)
        return false;
      continue;
    }

    // Get length values where the ray intersects the box
    let t1 = (lo - o) / d
    let t2 = (hi - o) / d;
    if (t1 > t2)
      [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax)
      return false;
  }

  return false;
}





