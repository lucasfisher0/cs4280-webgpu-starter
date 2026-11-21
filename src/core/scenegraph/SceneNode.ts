import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts"
import {Transform} from "@/core/scenegraph/Transform.ts"
import {Mesh} from "@/core/render/Mesh.ts"

let nodeCount: number = 0;

/**
 * Unlike all existing implementations, the SceneNode class is NOT linked to the
 * provided JavaScript implementation. The reason for this is to allow for complete
 * overrides of the TypeScript implementations, which is not possible without a lot of
 * hacks.
 *
 * Instead, TypeScript paradigms are used, such as interfaces that include necessary
 * data for subclassed nodes. Data structures should resemble the native JS implementations,
 * and instead only provide additions when not referencing subclass-specific data.
 */

interface SceneNodeDescriptor {
  name?: string | null;
  translation?: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
}
export type {SceneNodeDescriptor};

type TraverseFunction = (node: SceneNode, parent: SceneNode | null) => void;

/**
 * Corresponds to `SceneNode` from given content. Represents a singular transform.
 */
export class SceneNode {
  readonly guid: string = crypto.randomUUID();
  name: string;
  transform: Transform;
  children: SceneNode[] = [];
  parent: SceneNode | null = null;

  constructor(desc: SceneNodeDescriptor) {
    this.name = desc.name ?? `node_${nodeCount++}`;
    this.transform = new Transform(desc.translation, desc.rotation, desc.scale);
  }

  /** Adds child to this node. **/
  addChild(child: SceneNode) {
    this.children.push(child);
    child.parent = this;
    return child;
  }
  /** Adds multiple children to this node. **/
  addChildren(childen: SceneNode[]) {
    childen.forEach(child => {
      this.children.push(child);
      child.parent = this;
    });
  }
  /** Adds this node to another. */
  addToNode(parent: SceneNode): this {
    parent.addChild(this);
    return this;
  }

  /** Finds the first descendant (or this node) with the given name or guid. */
  find(name?: string, guid?: string): SceneNode | null {
    if (!name && !guid)
      throw new Error("SceneNode: Find was called with a provided name or guid!");

    if ((name && this.name === name) || (guid && this.guid === guid))
      return this;
    for (const child of this.children) {
      const found = child.find(name, guid);
      if (found)
        return found;
    }

    return null;
  }

  /**
   * Calculates world position using the given parent transform.
   * @param [parentWorldTransform]
   */
  updateWorldTransform(parentWorldTransform: Mat4 = Mat4.Identity()) {
    this.transform.parent = parentWorldTransform;
    for (const child of this.children)
      child.updateWorldTransform(this.transform.worldTransform);
  }

  /**
   *  Traverses a node hierarchy from the root, and calls a given function on this node and all children.
   * @param visit
   * @param [parent]
   */
  traverse(visit: TraverseFunction, parent: SceneNode | null = null) {
    visit(this, parent);
    for (const child of this.children)
      child.traverse(visit, this);
  }

  /**
   *  Tick occurs on every SceneNode, once per frame.
   * @param _dt
   */
  tick(_dt: number): void {
    // NOOP - purely a virtual function
  }
}
