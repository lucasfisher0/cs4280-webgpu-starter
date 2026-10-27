import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import {Camera} from "@/core/render/Camera.ts";

/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
export class OrbitCamera extends Camera {
  tetherDistance: number = 5;
  tetherRotation: [number, number, number] = [0, 0, 0];
  sensitivity: [number, number] = [0.1, 0.1];

  spinSpeed: number = 0.2; // Speed to spin in radians/sec
  spinEnabled: boolean = false;

  override getWorldTransform(): Mat4 {
    // Compose the real node position with the camera boom
    let origin: Mat4 = super.getWorldTransform();
    let tether: Mat4 = Mat4.multiply(
      Transform.fromEulerZYX(this.tetherRotation[0], this.tetherRotation[1], this.tetherRotation[2]),
      Transform.translate(0, 0, -this.tetherDistance)
    );

    return Mat4.multiply(tether, origin);
  }

  addRotation(yaw: number, pitch: number, roll: number = 0) {
    this.tetherRotation[0]! += pitch * this.sensitivity[0];
    this.tetherRotation[1]! += yaw * this.sensitivity[1];

    const DEG_89 = 1.55334303;
    if (Math.abs(this.tetherRotation[0]!) > DEG_89)
      this.tetherRotation[0] = DEG_89 * Math.sign(this.tetherRotation[0]!);
  }

  override tick(data: TickData) {
    this.addRotation(
      data.drag_movement[0] * data.deltaTime,
      data.drag_movement[1] * data.deltaTime);

    if (this.spinEnabled)
      this.tetherRotation[0]! += this.spinSpeed * data.deltaTime;
  }
}
