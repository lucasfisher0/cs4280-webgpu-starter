import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"

let nodeCount: number = 0;

interface SceneNodeDescriptor {
  name?: string | null;
  transform?: Mat4 | null;
  translation?: Mat4 | null;
  rotation?: Mat4 | null;
  scale?: Mat4 | null;
}
export type {SceneNodeDescriptor};

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

    if (desc.transform)
      this._localTransform = desc.transform;
    else
      this._localTransform = Mat4.multiplyAll([
        desc.translation ?? Transform.translate(0, 0, 0),
        desc.rotation ?? Mat4.Identity(),
        desc.scale ?? Transform.scale(1, 1, 1)
      ]);

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
  public get worldTransform(): Mat4 { return this._worldTransform; };
  public set worldTransform(transform: Mat4) {
    if (this.parent)
      transform = transform.multiply(this.parent.worldTransform.invert());
    this._localTransform = transform;
    this.#transformDirty = true;
  };

  updateWorldTransform(parentWorldTransform: Mat4 = Mat4.Identity()) {
    if (this.parent)
      this._worldTransform = Mat4.multiply(this.parent.worldTransform, this._localTransform);

    if (!this.#transformDirty)
      return;

    for (const child of this.children)
      child.updateWorldTransform(this._worldTransform);

    this.#transformDirty = false;
  }

  tick(data: TickData): void {
    // NOOP - purely a virtual function
  }
}
