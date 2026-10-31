import * as JSVec3 from "@/lib/math/vec3.js";
import * as JSMat4 from "@/lib/math/mat4.js";
import * as JSVec4 from "@/lib/math/vec4.js";

import {Vec3} from "@/core/math/Vec3.ts";

export class Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /* Object Meta */
  clone(): Vec4 {
    return Vec4.fromArray(JSVec4.clone(this.toArray()));
  }

  static Zero(): Vec4 {
    return new Vec4(0, 0, 0, 0);
  }

  // Converts a flat array of numbers to Vec4
  static fromArray(arr: any[]): Vec4 {
    return new Vec4(arr[0], arr[1], arr[2], arr[3]);
  }

  // Returns Vec4 as an array of numbers
  toArray(): number[] {
    return [this.x, this.y, this.z, this.w];
  }

  // Converts an array of Vec4 into a flat array of numbers
  static flatArray(arr: Vec4[]): number[] {
    return arr.flatMap(vec => vec.toArray());
  }

  // Converts an array of numbers into an array of Vec4
  static fromList(list: number[] | Float32Array): Vec4[] {
    let arr: Vec4[] = [];
    for (let i = 0; i < list.length; i += 4) {
      arr.push(new Vec4(
        list[i]!,     // TODO: is there any way to do val ?? throw exception inline as in C#?
        list[i + 1]!, // Also, there should be more safety here!
        list[i + 2]!,
        list[i + 3]!,
      ));
    }
    return arr;
  }

  /* Object Operations & Properties */

  /* Static Operations */
  static add(a: Vec4, b: Vec4): Vec4 {
    return Vec4.fromArray(JSVec4.add(a.toArray(), b.toArray()));
  }

  static sub(a: Vec4, b: Vec4): Vec4 {
    return Vec4.fromArray(JSVec4.sub(a.toArray(), b.toArray()));
  }

  static scale(a: Vec4, s: number): Vec4 {
    return Vec4.fromArray(JSVec4.scale(a.toArray(), s));
  }

  static dot(a: Vec4, b: Vec4): number {
    return JSVec4.dot(a.toArray(), b.toArray());
  }

  static lerp(a: Vec4, b: Vec4, t: number): Vec4 {
    let arr = JSVec3.lerp(a.toArray(), b.toArray(), t);
    return new Vec4(arr[0], arr[1], arr[2], arr[3]);
  }

  // perspectiveDivide originally in mat4.js
  static perspectiveDivide(v: Vec4): Vec3 {
    return Vec3.fromArray(JSMat4.perspectiveDivide(v.toArray()));
  }
}
