import {describe, expect, test} from "vitest";
import {Vec2} from "@/core/math/Vec2";
import {Vec3} from "@/core/math/Vec3";
import {Vec4} from "@/core/math/Vec4";
import {Mat4} from "@/core/math/Mat4";
import * as Transform from "@/core/math/Transform.ts"
import {compareMatrix, compareMatrixError} from "@/core/debug/Mat4";

function deg2rad(deg: number) {
  return deg * Math.PI / 180;
}

test("Transform", () => {
  expect(true).toBeTruthy();
});
