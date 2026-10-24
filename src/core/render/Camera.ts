import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import {SceneNode} from "@/core/scenegraph/SceneNode";

/* export enum FOV_TYPE {
  HORIZONTAL,
  VERTICAL,
  DEGREES,
  RADIANS
} // TODO: use these to support setting FOV in any format
*/

/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
export class Camera extends SceneNode {
  clipNear: number = 1;
  clipFar: number = 50;
  verticalFov: number = 1.0472; // 60 deg, vertical FoV

  getViewMatrix(target?: Vec3) {
    return Transform.lookAt(
      this.getWorldTransform().getPosition(),
      target ?? Vec3.Zero(),
      new Vec3(0, 1, 0)
    );
  }
}
