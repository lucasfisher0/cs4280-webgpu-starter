import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math"
import * as JSSceneNode from "@/lib/scenegraph/SceneNode.js"

let nodeCount: number = 0;

interface SceneNodeDescriptor {
  name: string;
  translation?: Mat4 | null;
  rotation?: Mat4 | null;
  scale?: Mat4 | null;
  mesh?: undefined | null;
  data?: undefined | null;
}
export type { SceneNodeDescriptor };

/**
 * Corresponds to `SceneNode` from given content. Represents a singular transform.
 */
export class SceneNode {
  readonly guid: string = crypto.randomUUID();
  name: string;
  translation: Mat4;
  rotation: Mat4;
  scale: Mat4;
  children: SceneNode[] = [];
  parent: SceneNode | null = null;

  constructor(desc: SceneNodeDescriptor) {
    this.name = desc.name ?? `node_${nodeCount}`;
    this.translation = desc.translation ?? Transform.translate(0, 0, 0);
    this.rotation = desc.rotation ?? Mat4.identity();
    this.scale = desc.scale ?? Transform.scale(1, 1, 1);
    nodeCount++;
  }

  /** Adds child to this node. **/
  addChild(child: SceneNode) {
    this.children.push(child);
    child.parent = this;
    return child;
  }

  /** Finds the first descendant (or this node) with the given `name`, or `null`. */
  find(name: string): SceneNode | null {
    if (this.name === name)
      return this;
    for (const child of this.children) {
      const found = child.find(name);
      if (found)
        return found;
    }

    return null;
  }

  /** Applies all parent transformations. **/
  getWorldTransform(): Mat4 {
    if (this.parent)
      return Mat4.multiply(this.parent.getTransformMatrix(), this.getTransformMatrix());

    return this.getTransformMatrix();
  }

  /** Returns composed TRS matrix in local-space. **/
  getTransformMatrix(): Mat4 {
    return Mat4.multiplyAll([this.translation, this.rotation, this.scale]);
  }
}
