import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";

/**
 * Extensions to allow for extraction of independent TRS matrices from a composed transform.
 */
declare module '@/core/math/Mat4' {
  interface Mat4 {
    translation(): Mat4;
    rotation(): Mat4;
    scale(): Mat4;
  }
}

Mat4.prototype.translation = function(this: Mat4): Mat4 {
  return this;
};

Mat4.prototype.rotation = function(this: Mat4): Mat4 {
  return this;
};

Mat4.prototype.scale = function(this: Mat4): Mat4 {
  return this;
};
