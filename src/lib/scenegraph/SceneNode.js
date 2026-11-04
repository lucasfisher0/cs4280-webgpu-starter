import * as mat4 from "@/lib/math/mat4.js";



/**
 * All existing implementation in TypeScript simply wrap the existing JS implementations,
 * SceneNode however is completely rewritten in TypeScript.
 *
 * Aside from the minimum required functionality and some tests, this class will remain
 * unchanged.
 */




/**
 * A minimal, renderer-agnostic scene graph node: a local transform, an
 * optional payload (a mesh to draw, or `null` for a pure "joint" node that
 * only exists to carry a transform to its children), and child nodes.
 *
 * `updateWorldTransforms()` and `traverse()` below are part of Assignment 7's
 * deliverable — parent-child transform inheritance, recursively
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

  /** Updates the world transforms for this node and all descendants. */
  updateWorldTransforms(_parentWorldTransform = mat4.identity()) {
    this.worldTransform = mat4.multiply(_parentWorldTransform, this.localTransform);
    for (const child of this.children) {
      child.updateWorldTransforms(this.worldTransform);
    }
  }

  /** Traverses node and all children, calling a provided visitation function. */
  traverse(_visit) {
    _visit(this);
    for (const child of this.children)
      child.traverse(_visit);
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
