import * as JSMat4 from "@/lib/math/mat4.js";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import * as Transform from "@/core/math/Transform.ts";

interface SVDResult {
  U: Mat4;
  S: Vec4; // Diagonal singular values
  V: Mat4;
}

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

  static fromSingularValues(values: Vec4) {
    const arr: number[] = [
      values.x, 0,        0,               0,
      0,        values.x, 0,               0,
      0,        0,        values.x,        0,
      0,        0,        0,        values.x,
    ];

    return Mat4.fromArray(arr);
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

  /**
   * Returns a string representation of a 4x4 matrix.
   * Hardcoded limit of 2 whole places before truncation.
   * @param decimals - Amount of decimals to print.
   * @see `debug\Mat4.ts:stringifyMatrix`.
   */
  getString(decimals: number = 2): string {
    let out: string = "";
    for (let i = 0; i < this.arr.length; i++) {
      if (i % 4 == 0)
        out += "\n\t";

      const val = this.arr[i]!.toFixed(decimals);
      let str = val.toString().slice(0, decimals + 3);
      out += str.padEnd(3) + " ";
    }

    return out;
  }

  /** Returns position as `Vec3` coordinates. */
  position(): Vec3 {
    return new Vec3(this.arr[12]!, this.arr[13]!, this.arr[14]!);
  };

  /** Returns scaling as `Vec3` factors.
   *  @deprecated Requires SVD implementation to find scale on ORIGINAL axes.
   */
  scale3(): Vec3 {
    const sx = new Vec3(
      this.arr[0]!,
      this.arr[4]!,
      this.arr[8]!).length();
    const sy = new Vec3(
      this.arr[1]!,
      this.arr[5]!,
      this.arr[9]!).length();
    const sz = new Vec3(
      this.arr[2]!,
      this.arr[6]!,
      this.arr[10]!).length();

    return new Vec3(sx, sy, sz);
  };

  /** Returns translation component as a standalone matrix. */
  translation(): Mat4 {
    return Transform.translate(this.arr[12]!, this.arr[13]!, this.arr[14]!);
  };

  /** Returns rotation component as a standalone matrix.
   * @deprecated Requires SVD implementation for original axes.
   * */
  rotation(): Mat4 {
    throw new Error("Mat4: Rotation extraction not yet implemented, awaiting SVD.");
  };

  /** Returns scale component as a standalone matrix.
   * @deprecated Requires SVD implementation for original axes.*/
  scale(): Mat4 {
    const scale = this.scale3();
    return Transform.scale(scale.x, scale.y, scale.z)
  };

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
