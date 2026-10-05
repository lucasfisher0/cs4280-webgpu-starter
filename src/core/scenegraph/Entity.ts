import {translate as matrixTranslate, scale as matrixScale} from "@/lib/math/transforms.js";
import {identity as matrixIdentity, multiply, multiplyAll} from "@/lib/math/mat4.js";

let nodeCount: number = 0;

/**
 * Corresponds to `SceneNode` from given content. Represents a singular transform.
 */
export class Entity {
  readonly guid: string = crypto.randomUUID();
  name: string;
  translation: Float32Array;
  rotation: Float32Array;
  scale: Float32Array;
  children: Entity[] = [];
  parent: Entity | null = null;

  constructor(
      name?: string,
      translation?: Float32Array,
      rotation?: Float32Array,
      scale?: Float32Array
  ) {
    this.name = name ?? `node_${nodeCount}`;
    this.translation = translation ?? matrixTranslate(0, 0, 0);
    this.rotation = rotation ?? matrixIdentity();
    this.scale = scale ?? matrixScale(1, 1, 1);
    nodeCount++;
  }

  addChild(child: Entity) {
    this.children.push(child);
    child.parent = this;
    return child;
  }

  getWorldTransform(): Float32Array {
    if (this.parent)
      return multiply(this.parent.getTransformMatrix(), this.getTransformMatrix());

    return this.getTransformMatrix();
  }

  getTransformMatrix(): Float32Array {
    return multiplyAll([this.translation, this.rotation, this.scale]);
  }
}
