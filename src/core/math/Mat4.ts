import * as JSMat4 from "@/lib/math/mat4.js";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";

export class Mat4 {
  arr: Float32Array;

  constructor(data: Float32Array) {
    this.arr = data;
  }

  /* Object Meta */
  clone(): Mat4 {
    return new Mat4(JSMat4.clone(this.arr));
  }

  static Identity(): Mat4 {
    return new Mat4(JSMat4.identity());
  }

  // Converts a flat array of numbers to Mat4
  static fromArray(arr: number[]) {
    return new Mat4(new Float32Array(arr));
  }

  // Returns Mat4 as an array of numbers
  toArray(): number[] {
    return [...this.arr];
  }

  /** Converts an array of `Mat4` into a flat array of numbers. */
  static flatArray(arr: Mat4[]): number[] {
    return arr.flatMap(x => x.toArray());
  }

  /* Object Operations & Properties */
  // TODO: Merge this with the debug stringify.
  getString(): string {
    let str: string = "";
    for (let i = 0; i < this.arr.length; i++) {
      str += this.arr[i]!.toString().padStart(3, ' ');
      if (i != 0 && i != this.arr.length && (i+1) % 4 === 0)
        str += "\n"
    }
    return str;
  }

  /** Transforms a `Vec3` point (implicit `w = 1`) by `m`, returning the full `Vec4` quadruple *before* any perspective divide. */
  transformPoint(p: Vec3): Mat4 {
    return Mat4.fromArray(JSMat4.transformPoint(this.toArray(), p.toArray()));
  }

  // perspectiveDivide implemented in Vec4.

  /** Returns the transpose of the matrix. */
  transpose(): Mat4 {
    return new Mat4(JSMat4.transpose(this.toArray()));
  }

  /**
   * General 4x4 inverse via Gauss-Jordan elimination with partial pivoting.
   * Throws if `m` is singular (or numerically too close to singular).
   * Used for normal matrices (`transpose(invert(modelMatrix))`) and similar —
   * a generic linear-algebra tool, not itself a "graphics algorithm".
   */
  invert(): Mat4 {
    return new Mat4(JSMat4.invert(this.toArray()));
  }

  /** Applies a matrix transformation to an existing matrix. */
  multiply(a: Mat4): Mat4 {
    return new Mat4(JSMat4.multiply(a.arr, this.arr));
  }

  /* Static Operations & Properties */
  /** Returns `a * b` (column-vector convention: `(a * b) * v === a * (b * v)`). */
  static multiply(a: Mat4, b: Mat4): Mat4 {
    return new Mat4(JSMat4.multiply(a.arr, b.arr));
  }

  /** Transforms a homogeneous `[x, y, z, w]` vector by `m`. */
  static multiplyVec4(m: Mat4, v: Vec4): Vec4 {
    return Vec4.fromArray(JSMat4.multiplyVec4(m.toArray(), v.toArray()));
  }

  /** Left-to-right `reduce` of `multiply` over a list of matrices. */
  static multiplyAll(matrices: Mat4[]): Mat4 {
    return Mat4.fromArray(JSMat4.multiplyAll(
      matrices.map((m: Mat4) => m.toArray())
    ));
  }
}
