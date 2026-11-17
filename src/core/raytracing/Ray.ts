import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"


export interface IRay {
  origin: Vec3;
  direction: Vec3;
  evaluate(t: number): Vec3;
}

export class ScreenRay implements IRay{
  origin: Vec3;
  direction: Vec3;
  length: number = 500;

  constructor(origin: Vec3 | null, direction: Vec3, length?: number) {
    this.origin = origin ?? Vec3.Zero();
    this.direction = direction.normalize();
    this.length = length ?? this.length;
  }

  evaluate(t: number) {
    const endPoint = Vec3.scale(this.direction, t);
    return Vec3.add(this.origin, endPoint);
  }
}
