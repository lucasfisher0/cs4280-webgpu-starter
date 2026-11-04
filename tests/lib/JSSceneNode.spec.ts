import {describe, expect, test} from "vitest";
import {Mat4} from "@/core/math/Mat4";
import * as Transform from "@/core/math/Transform"
import {SceneNode} from "@/lib/scenegraph/SceneNode.js"

test("Constructor", () => {

  const m = Mat4.multiplyAll([
    Transform.translate(1, 2, 3),
    Transform.rotateX(Math.PI / 2),
    Transform.scale(2, 1, 1)
  ]);

  const desc = {
    localTransform: new Float32Array([...m.toArray()]),
    mesh: "mesh",
    data: "data"
  };

  // @ts-ignore
  const root = new SceneNode("root", desc);
  expect(root.name).toEqual("root");
  expect(root.localTransform).toEqual(m.arr);
  expect(root.mesh).toEqual("mesh");
  expect(root.data).toEqual("data");
});


describe("Node Hierarchy", () => {
  const transform = Mat4.multiply(Transform.translate(1, 2, 3), Mat4.Identity());

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

  test("updateWorldTransforms", () => {
    node1.updateWorldTransforms();

    // Only checks for composition of a simple translation, add more complexity in the future if needed
    const exp = Mat4.multiplyAll([transform, transform, transform]);
    expect([...node3.worldTransform]).toEqual(exp.toArray())
  });

  test("traversal", () => {
    let nodes: string[] = [];
    node1.traverse((node: SceneNode) => {
      nodes.push(node.name);
    })

    expect(nodes.length).toEqual(3);
    expect(nodes).toContain("body");
    expect(nodes).toContain("limb");
    expect(nodes).toContain("limb_end");
  });
});

