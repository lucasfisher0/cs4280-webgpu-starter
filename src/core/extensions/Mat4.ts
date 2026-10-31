import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts";

export {};

/**
 * Extensions to allow for extraction of independent TRS matrices from a composed transform.
 */
declare module '@/core/math/Mat4' {
  interface Mat4 {
    position(): Vec3;
    scale3(): Vec3;

    translation(): Mat4;
    rotation(): Mat4;
    scale(): Mat4;
  }
}

Mat4.prototype.position = function(this: Mat4): Vec3 {
  return new Vec3(this.arr[12]!, this.arr[13]!, this.arr[14]!);
};

Mat4.prototype.scale3 = function(this: Mat4): Vec3 {
  const sx = new Vec3(
    this.arr[0]!*this.arr[0]!,
    this.arr[4]!*this.arr[4]!,
    this.arr[8]!*this.arr[8]!).length();
  const sy = new Vec3(
    this.arr[1]!*this.arr[1]!,
    this.arr[5]!*this.arr[5]!,
    this.arr[9]!*this.arr[9]!).length();
  const sz = new Vec3(
    this.arr[2]!*this.arr[2]!,
    this.arr[6]!*this.arr[6]!,
    this.arr[10]!*this.arr[10]!).length();

  return new Vec3(sx, sy, sz);
};

Mat4.prototype.translation = function(this: Mat4): Mat4 {
  return Transform.translate(this.arr[12]!, this.arr[13]!, this.arr[14]!);
};

Mat4.prototype.rotation = function(this: Mat4): Mat4 {
  const scale = this.scale3();
  // return Transform.fromEulerZYX()


  return Mat4.Identity();
};

Mat4.prototype.scale = function(this: Mat4): Mat4 {
  const scale = this.scale3();
  return Transform.scale(scale.x, scale.y, scale.z)
};
