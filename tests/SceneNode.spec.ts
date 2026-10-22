import {describe, expect, test} from "vitest";
import {SceneNode} from "@/core/scenegraph/SceneNode";
import {rotateX, rotateZ, scale, translate} from "@/lib/math/transforms";
import {stringifyMatrix} from "@/core/debug/mat4";
import {encodePPM} from "@/lib/image/ppm";
import {multiply} from "@/lib/math/mat4";

describe("Node Transform", () => {

  const t = translate(1, 2, 3);
  const r = rotateZ(-Math.PI / 2);
  const s = scale(2, 3, 4);
  let cube = new SceneNode({
    name: "",
    translation: t,
    rotation: r,
    scale: s
  });

  test("TRS Composition", () => {
    const transform = cube.getTransformMatrix();
    const desiredTransform = new Float32Array([
      0, -2, 0, -4,
      3, 0, 0, 3,
      0, 0, 4, 12,
      0, 0, 0, 1,
    ]);

    for (let i = 0; i < transform.length; i++) {
      expect(transform[i], `Translate: ${stringifyMatrix(t)}\nRotation: ${stringifyMatrix(r)}\nScale: ${stringifyMatrix(s)}\n\nActual: ${stringifyMatrix(transform)}\nDesired: ${stringifyMatrix(desiredTransform)}`).toBeCloseTo(desiredTransform[i] ?? Infinity, 3);
    }
  })

  test("Parent-Child Composition", () => {
    let parentCube = new SceneNode({
      name: "",
      translation: translate(1, 2, 3),
      rotation: rotateX(Math.PI / 2),
      scale: scale(2, 2, 2)
    });

    parentCube.addChild(cube);
    expect(cube.parent).toBe(parentCube);

    const transform = cube.getWorldTransform();
    const desiredTransform = multiply(parentCube.getTransformMatrix(), cube.getTransformMatrix());

    for (let i = 0; i < transform.length; i++) {
      expect(transform[i],
        `Actual: ${stringifyMatrix(transform)}\nDesired: ${stringifyMatrix(desiredTransform)}`)
        .toBeCloseTo(desiredTransform[i]!, 3);
    }
  })

});
