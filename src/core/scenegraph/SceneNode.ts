import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"
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
  localTransform?: Mat4 | null;
}
export type {SceneNodeDescriptor};

type TraverseFunction = (node: SceneNode, parent: SceneNode | null) => void;

/**
 * Corresponds to `SceneNode` from given content. Represents a singular transform.
 */
export class SceneNode {
  readonly guid: string = crypto.randomUUID();
  name: string;
  _localTransform: Mat4;
  _worldTransform: Mat4;
  #transformDirty: boolean = true;
  children: SceneNode[] = [];
  parent: SceneNode | null = null;

  constructor(desc: SceneNodeDescriptor) {
    this.name = desc.name ?? `node_${nodeCount++}`;
    this._localTransform = desc.localTransform ?? Mat4.Identity();
    this._worldTransform = this._localTransform;
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

  // Transforms
  public get transform(): Mat4 { return this._localTransform; };
  public set transform(transform: Mat4) { this._localTransform = transform; this.#transformDirty = true; }

  /**
   * Sets local transform on this scene node as a composite of Translation, Rotation, and Scale matrices.
   * @param translation
   * @param rotation
   * @param scale
   */
  public setTransform(translation?: Mat4, rotation?: Mat4, scale?: Mat4) {
    this.transform = Mat4.multiplyAll([translation ?? Mat4.Identity(), rotation ?? Mat4.Identity(), scale ?? Mat4.Identity()]);
  }

  public get worldTransform(): Mat4 { return this._worldTransform ?? this._localTransform; };
  public set worldTransform(transform: Mat4) {
    if (this.parent)
      transform = transform.multiply(this.parent.worldTransform.invert());
    this._localTransform = transform;
    this.#transformDirty = true;
  };

  /**
   * Calculates world position using the given parent transform.
   * @param [parentWorldTransform]
   */
  updateWorldTransform(parentWorldTransform: Mat4 = Mat4.Identity()) {
    this._worldTransform = Mat4.multiply(this._localTransform, parentWorldTransform);

    if (!this.#transformDirty)
      return;

    for (const child of this.children)
      child.updateWorldTransform(this._worldTransform);

    this.#transformDirty = false;
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
   * @param _data
   */
  tick(_data: TickData): void {
    // NOOP - purely a virtual function
  }
}
