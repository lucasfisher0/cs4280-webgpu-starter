import {describe, expect, test} from "vitest";
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math"

test("translate", () => {
  // Assignment 2 feedback:
  // For example, translate(2, -3, 4) applied to (1, 1, 1) gives (1, 1, 1, 4) instead of (3, -2, 5, 1).
  const v: Vec4 = new Vec4(1, 1, 1, 1);
  const m: Mat4 = Transform.translate(2, -3, 4);
  const out: Vec4 = Mat4.multiplyVec4(m, v);
  const expected: Vec4 = new Vec4(3, -2, 5, 1);

  expect(out.x).toEqual(expected.x);
  expect(out.y).toEqual(expected.y);
  expect(out.z).toEqual(expected.z);
  expect(out.w).toEqual(expected.w);
});

/*

describe("lookAt", () => {
  const eye = [0, 0, 5];
  const target = [0, 0, 0];
  const up = [0, 1, 0];
});

describe("rotateY - Triangle Example", () => {
  const v_0 = new Float32Array([0, 0, 0]);
  const v_1 = new Float32Array([1, 0, 0]);
  const v_2 = new Float32Array([0, 0, 0.5]);

  const r = rotateY(Math.PI / 2);

  const o_0 = Mat4.transformPoint(r, v_0);
  const o_1 = Mat4.transformPoint(r, v_1);
  const o_2 = Mat4.transformPoint(r, v_2);

  let i = 0;
});

*/
