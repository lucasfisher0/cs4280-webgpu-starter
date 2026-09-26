import { describe, expect, test } from "vitest";
import { Entity } from "@/assignments/a2-transforms-camera/entity";
import {rotateZ, scale, translate} from "@/lib/math/transforms";


test("TRS Composition", () => {
  const t = translate(1, 2, 3);
  const r = rotateZ(Math.PI / 2);
  const s = scale(2, 3, 4);

  let cube = new Entity(t, r, s);
  const transform = cube.getTransformMatrix();

  const desiredTransform = new Float32Array([
    0, -2, 0, -4,
    3,  0, 0,  3,
    0,  0, 4,  12,
    0,  0, 0,  1,
  ]);

  for (let i = 0; i < transform.length; i++) {
    expect(transform[i]).toBeCloseTo(desiredTransform[i], 3);
  }
})
