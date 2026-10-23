import {describe, expect, test} from "vitest";
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math"
import {SceneNode} from "@/lib/scenegraph/SceneNode.js"


test("updateWorldTransforms", () => {
  const transform = Mat4.multiply(Transform.translate(1, 2, 3), Mat4.identity());

  const node1 = new SceneNode("body",
    {
      localTransform: new Float32Array(transform.toArray()),
      mesh: null,
      data: null
    });
  const node2 = new SceneNode("limb",
    {
      localTransform: new Float32Array(transform.toArray()),
      mesh: null,
      data: null
    });
  const node3 = new SceneNode("limb_end",
    {
      localTransform: new Float32Array(transform.toArray()),
      mesh: null,
      data: null
    });

  node1.children.push(node2);
  node2.children.push(node3);
  node1.updateWorldTransforms();

  // Only checks for composition of a simple translation, add more complexity in the future if needed
  const exp = Mat4.multiplyAll([transform, transform, transform]);
  expect([...node3.worldTransform]).toEqual(exp.toArray())
});
