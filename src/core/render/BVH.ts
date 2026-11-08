import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"

import {type IRay} from "@/core/raytracing/Ray.ts";


type BoundingBox = {
  min: Vec3;
  max: Vec3;
}
export type {BoundingBox};

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

/** Tests whether bounding box contains the given ray. */
export function testRay(ray: IRay, length: number, box: BoundingBox): boolean {

  let start = ray.origin;
  let end = ray.evaluate(length);

  // Check for starting past box bounds
  if (
    (ray.direction.x <= 0 && start.x > box.max.x) ||
    (ray.direction.y <= 0 && start.y > box.max.y) ||
    (ray.direction.z <= 0 && start.z > box.max.z)
  )
    return false;

  // Check for ending before box bounds
  if (
    (ray.direction.x >= 0 && end.x < box.max.x) ||
    (ray.direction.y >= 0 && end.y < box.max.y) ||
    (ray.direction.z >= 0 && end.z < box.max.z)
  )
    return false;














  let t1 = (box.min.x - ray.origin.x) / ray.direction.x;
  let t2 = (box.max.x - ray.origin.x) / ray.direction.x;

  if (t1 > t2)
    [t1, t2] = [t2, t1];




  // let t1 = (lo - o) / d;
  // let t2 = (hi - o) / d;
  // if (t1 > t2) [t1, t2] = [t2, t1];
  // tMin = Math.max(tMin, t1);
  // tMax = Math.min(tMax, t2);
  // // Early out: the interval is empty (also covers tMax < 0).
  // if (tMin > tMax) return false;









  return false;
}





