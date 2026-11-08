import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";

// export abstract class Vector {
//   abstract toArray(): number[];
//
//   static Zero<T extends Vector>(): T {
//     return createZeroFilled(this);
//   };
// }

type Vector = Vec2 | Vec3 | Vec4;

/**
 * Interleaves data from all given vectors into a single number array.
 * The longest array is used, and any missing information from other arrays is zero-filled.
 * @param v - Array of vector arrays (ex. `Vec2[]`, `Vec3[]`, or `Vec4[]`.)
 */
export function interleaveVectors(v: Vector[][]): Float32Array {
  const len = Math.max(...v.map(arr => arr.length));
  let dat: number[] = [];
  for (let i = 0; i < len; i++) {
    for(let j = 0; j < v.length; j++) {
      if (i <= v[j]!.length)
        dat.push(...v[j]![i]!.toArray());
      else {
        if (v[j]![0] instanceof Vec2)
          dat.push(...Vec2.Zero().toArray());
        else if (v[j]![0] instanceof Vec3)
          dat.push(...Vec3.Zero().toArray());
        else if (v[j]![0] instanceof Vec4)
          dat.push(...Vec4.Zero().toArray());
      }
    }
  }
  return new Float32Array(dat);
}
