import {describe, expect, test} from "vitest";
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math"
import {OrbitCamera} from "@/core/render/OrbitCamera";

test("translate", () => {
  let cam = new OrbitCamera()


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
