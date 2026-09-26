import { describe, expect, test } from "vitest";
import { Entity } from "@/assignments/a2-transforms-camera/entity";


test("TRS Composition", () => {
  const t = new Float32Array([
    1, 0, 0, 1,
    0, 1, 0, 2,
    0, 0, 1, 3,
    0, 0, 0, 1,
  ]);

  const r = new Float32Array([
    0, -1, 0, 0,
    1,  0, 0, 0,
    0,  0, 1, 0,
    0,  0, 0, 1,
  ]);

  const s = new Float32Array([
    2, 0, 0, 0,
    0, 3, 0, 0,
    0, 0, 4, 0,
    0, 0, 0, 1,
  ]);

  let cube = new Entity(t, r, s);
  const transform = cube.getTransformMatrix();

  const desiredTransform = new Float32Array([
    0, -2, 0, 4,
    3,  0, 0, 3,
    0,  0, 4, 12,
    0,  0, 0, 1,
  ]);

  for (let i = 0; i < transform.length; i++) {
    expect(transform[i]).toBe(desiredTransform[i]);
  }
})
