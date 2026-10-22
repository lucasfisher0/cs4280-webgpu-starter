import * as Transforms from "@/lib/math/transforms.js"
import * as Mat4 from "@/lib/math/mat4.js"

let nodeCount: number = 0;

interface SceneNodeDescriptor {
  name: string;
  translation?: Float32Array<ArrayBuffer> | null;
  rotation?: Float32Array<ArrayBuffer> | null;
  scale?: Float32Array<ArrayBuffer> | null;
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
  translation: Float32Array;
  rotation: Float32Array;
  scale: Float32Array;
  children: SceneNode[] = [];
  parent: SceneNode | null = null;

  constructor(desc: SceneNodeDescriptor) {
    this.name = desc.name ?? `node_${nodeCount}`;
    this.translation = desc.translation ?? Transforms.translate(0, 0, 0);
    this.rotation = desc.rotation ?? Mat4.identity();
    this.scale = desc.scale ?? Transforms.scale(1, 1, 1);
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
  getWorldTransform(): Float32Array {
    if (this.parent)
      return Mat4.multiply(this.parent.getTransformMatrix(), this.getTransformMatrix());

    return this.getTransformMatrix();
  }

  /** Returns composed TRS matrix in local-space. **/
  getTransformMatrix(): Float32Array {
    return Mat4.multiplyAll([this.translation, this.rotation, this.scale]);
  }
}
