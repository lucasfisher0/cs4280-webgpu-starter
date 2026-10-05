import { describe, expect, test } from "vitest";
import {lookAt, rotateY} from "@/lib/math/transforms";
import * as Vec3 from "@/lib/math/vec3.js";
import * as Vec4 from "@/lib/math/vec4.js";
import * as Mat4 from "@/lib/math/mat4.js";


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

