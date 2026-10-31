import {describe, expect, test} from "vitest";

import {Vec2} from "@/core/math/Vec2";
import {Vec3} from "@/core/math/Vec3";
import {Vec4} from "@/core/math/Vec4";
import {Mat4} from "@/core/math/Mat4";
import * as Transform from "@/core/math/Transform.ts"
import {compareMatrix, compareMatrixError, stringifyMatrix} from "@/core/debug/Mat4";
// @ts-ignore
import "@/core/extensions/Mat4.ts"


describe("Composition", () => {
  // Assignment 2 feedback:
  // For example, translate(2, -3, 4) applied to (1, 1, 1) gives (1, 1, 1, 4) instead of (3, -2, 5, 1).
  const v: Vec4 = new Vec4(1, 1, 1, 1);
  const m: Mat4 = Transform.translate(2, -3, 4);

  test("Translate", () => {
    const out: Vec4 = Mat4.multiplyVec4(m, v);
    const expected: Vec4 = new Vec4(3, -2, 5, 1);

    expect(out.x).toEqual(expected.x);
    expect(out.y).toEqual(expected.y);
    expect(out.z).toEqual(expected.z);
    expect(out.w).toEqual(expected.w);
  });

  test("Rotated", () => {
    const mm = m.multiply(Transform.rotateX(90));
    const out: Vec4 = Mat4.multiplyVec4(mm, v);
    const expected: Vec4 = new Vec4(3, -2, 5, 1);

    expect(out.x).toEqual(expected.x);
    expect(out.y).toEqual(expected.y);
    expect(out.z).toEqual(expected.z);
    expect(out.w).toEqual(expected.w);
  });

  test("Vec3 Position", () => {
    const out: Mat4 = Mat4.multiply(m, Mat4.Identity());
    const pos = out.position();
    const expected = new Vec3(3, -2, 5);
    expect(pos.toArray()).toEqual(expected.toArray());
  });
});


describe("Extensions - Extractions", () => {

  const t = Transform.translate(3, 4, 5);
  const r = Transform.fromEulerZYX(45, 15, 30);
  const s = Transform.scale(1, 2, 3);
  const m = Mat4.multiplyAll([t, r, s]);

  test("Position", () => {
    const pos = m.position();
    expect(pos.x).toEqual(3);
    expect(pos.y).toEqual(4);
    expect(pos.z).toEqual(5);
  });

  test("Scale3", () => {
    const s = m.scale3();
    expect(s.x).toEqual(1);
    expect(s.y).toEqual(2);
    expect(s.z).toEqual(3);
  });

  test("Translation", () => {
    const mt = m.translation();
    const [equal, idx] = compareMatrix(mt, t);

    expect(equal, compareMatrixError(idx, mt, t)).toEqual(true);
  });
});
