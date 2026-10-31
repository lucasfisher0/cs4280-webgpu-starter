import {describe, expect, test} from "vitest";

import {Vec2} from "@/core/math/Vec2";
import {Vec3} from "@/core/math/Vec3";
import {Vec4} from "@/core/math/Vec4";
import {Mat4} from "@/core/math/Mat4";
import * as Transform from "@/core/math/Transform";
import {stringifyMatrix} from "@/core/debug/Mat4";
import {SceneNode} from "@/core/scenegraph/SceneNode";

describe("Node Transform", () => {

  let node1 = new SceneNode({
    name: "cube",
    translation: Transform.translate(1, 2, 3),
    rotation: Transform.rotateZ(-Math.PI / 2),
    scale: Transform.scale(2, 3, 4)
  });

  test("TRS Composition", () => {
    const transform = node1.transform;
    const desiredTransform = new Float32Array([
      0, -2, 0, -4,
      3, 0, 0, 3,
      0, 0, 4, 12,
      0, 0, 0, 1,
    ]);

    // for (let i = 0; i < transform.length; i++) {
    //   expect(transform[i], `Translate: ${stringifyMatrix(t)}\nRotation: ${stringifyMatrix(r)}\nScale: ${stringifyMatrix(s)}\n\nActual: ${stringifyMatrix(transform)}\nDesired: ${stringifyMatrix(desiredTransform)}`).toBeCloseTo(desiredTransform[i] ?? Infinity, 3);
    // }
  })

//  test("Parent-Child Composition", () => {
//    let parentCube = new SceneNode({
//      name: "",
//      translation: translate(1, 2, 3),
//      rotation: rotateX(Math.PI / 2),
//      scale: scale(2, 2, 2)
//    });
//
//    parentCube.addChild(cube);
//    expect(cube.parent).toBe(parentCube);
//
//    const transform = cube.getWorldTransform();
//    const desiredTransform = multiply(parentCube.getTransformMatrix(), cube.getTransformMatrix());
//
//    for (let i = 0; i < transform.length; i++) {
//      expect(transform[i],
//        `Actual: ${stringifyMatrix(transform)}\nDesired: ${stringifyMatrix(desiredTransform)}`)
//        .toBeCloseTo(desiredTransform[i]!, 3);
//    }
//  })

});
