import {translate as matrixTranslate, scale as matrixScale} from "@/lib/math/transforms.js";
import {identity as matrixIdentity, multiply, multiplyAll} from "@/lib/math/mat4.js";

/**
 * Represents an object with a transform.
 */
export class Entity {
  translation: Float32Array;
  rotation: Float32Array;
  scale: Float32Array;

  constructor(translation?: Float32Array, rotation?: Float32Array, scale?: Float32Array) {
    this.translation = translation ?? matrixTranslate(0, 0, 0);
    this.rotation = rotation ?? matrixIdentity();
    this.scale = scale ?? matrixScale(1, 1, 1);
  }

  getTransformMatrix(): Float32Array {
    //return multiplyAll([this.scale, this.rotation, this.translation]);
    return multiplyAll([this.translation, this.rotation, this.scale]);
  }
}
