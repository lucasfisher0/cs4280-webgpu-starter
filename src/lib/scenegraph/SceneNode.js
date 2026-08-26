import * as mat4 from "@/lib/math/mat4.js";

/**
 * A minimal, renderer-agnostic scene graph node: a local transform, an
 * optional payload (a mesh to draw, or `null` for a pure "joint" node that
 * only exists to carry a transform to its children), and child nodes.
 *
 * `updateWorldTransforms()` and `traverse()` below are Assignment 4's
 * actual deliverable — parent-child transform inheritance, recursively
 * traversed and rendered. They throw until you implement them; everything
 * else here (construction, `addChild`, `setLocalTransform`, `find`) is
 * bookkeeping you can use as-is.
 */
export class SceneNode {
  constructor(name, { localTransform = mat4.identity(), mesh = null, data = null } = {}) {
    this.name = name;
    this.localTransform = localTransform;
    this.mesh = mesh;
    this.data = data;
    this.children = [];
    this.worldTransform = mat4.identity();
  }

  addChild(child) {
    this.children.push(child);
    return child;
  }

  setLocalTransform(matrix) {
    this.localTransform = matrix;
  }

  /**
   * TODO: recompute `worldTransform` for this node (compose
   * `parentWorldTransform` with `this.localTransform` — see `mat4.js`'s
   * `multiply`) and then every descendant, in one top-down recursive pass.
   */
  updateWorldTransforms(_parentWorldTransform = mat4.identity()) {
    throw new Error("SceneNode.updateWorldTransforms: not implemented");
  }

  /**
   * TODO: a depth-first visit of this node and every descendant — call
   * `visit(node)` for this node, then recurse into each child. Call after
   * `updateWorldTransforms()`.
   */
  traverse(_visit) {
    throw new Error("SceneNode.traverse: not implemented");
  }

  /** Finds the first descendant (or this node) with the given `name`, or `null`. */
  find(name) {
    if (this.name === name) return this;
    for (const child of this.children) {
      const found = child.find(name);
      if (found) return found;
    }
    return null;
  }
}
