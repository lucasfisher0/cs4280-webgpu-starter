import {SceneNode} from "@/core/scenegraph/SceneNode";
import {Transform} from "@/core/Math.ts"

//import {lookAt} from "@/lib/math/transforms.js";

/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
export class Camera extends SceneNode {
  clipNear: number = 1;
  clipFar: number = 50;
  verticalFov: number = 1.0472; // 60 deg, vertical FoV

  getViewMatrix(target?: Float32Array) {
    target ??= new Float32Array([0, 0, 0]);

    let trans = this.getWorldTransform();

    return Transform.lookAt(
      this.getWorldTransform().getPosition(),
      target,
      new Float32Array([0, 1, 0]),
    );
  }
}
