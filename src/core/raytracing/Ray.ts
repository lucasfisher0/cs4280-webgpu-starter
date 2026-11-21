import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts"
import {type Shape} from "@/core/collision/Shapes.ts"
import * as Shapes from "@/core/collision/Shapes.ts"

export class Ray {
  origin: Vec3;
  direction: Vec3;
  length: number;

  constructor(origin: Vec3, direction: Vec3, length?: number) {
    this.origin = origin;
    this.direction = direction.normalize();
    this.length = length ?? direction.length();
  }

  evaluate(t: number) {
    const endPoint = Vec3.scale(this.direction, t);
    return Vec3.add(this.origin, endPoint);
  }
}

export class HitRecord {
  shape: Shape | null;
  t: number;
  position: Vec3;
  normal: Vec3;

  constructor(s: Shape | null, t: number | null, position: Vec3 | null, normal: Vec3 | null) {
    this.shape = s;
    this.t = t ?? Infinity;
    this.position = position ?? Vec3.Zero();
    this.normal = normal ?? Vec3.Zero();
  }
}



/*
class PointLight, subclass of Light
  Color I;  Vec3 p                                  // intensity, position
  Color illuminate(Ray ray, HitRecord hrec)
    Vec3  x = ray.evaluate(hrec.t)
    real  r = ‖p − x‖                              // distance to the light
    Vec3  l = (p − x) / r
    Vec3  v = −ray.d / ‖ray.d‖
    Color E = max(0, hrec.n · l) I / r²            // irradiance (Module 05)
    Color k = hrec.s.material.evaluate(l, v, hrec.n)   // reflectance: R/π + k_s max(0, n·h)^p
    return k E

function shade-ray(Ray ray, real t0, real t1)
  HitRecord rec = scene.hit(ray, t0, t1)
  if rec.t < ∞ then
    Color c = 0
    for light in scene.lights do
      c = c + light.illuminate(ray, rec)
    return c
  else
    return background-color

    // Shadows: page 34
    HitRecord srec = scene.hit(Ray(x, l), ε, r)     // ε, not 0: avoid hitting x's own surface
    if srec.t < ∞ then return 0                      // blocked: in shadow
    else  ... normal illumination ...
 */
