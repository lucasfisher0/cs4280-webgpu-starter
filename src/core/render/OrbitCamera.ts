import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts";
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


  public override get worldTransform() {
    return this._worldTransform;
  }

  override getCameraPosition(): Vec3 {
    // Compose the real node position with the camera boom
    let origin: Mat4 = super.worldTransform;
    let tether: Mat4 = Mat4.multiply(
      Transform.fromEulerZYX(this.tetherRotation[0], this.tetherRotation[1], this.tetherRotation[2]),
      Transform.translate(0, 0, -this.tetherDistance)
    );

    return Mat4.multiply(tether, origin).position();
  }

  addRotation(yaw: number, pitch: number, roll: number = 0) {
    // Pitch w/ Clamp
    this.tetherRotation[0]! += pitch * this.sensitivity[0];
    const DEG_89 = 1.55334303;
    if (Math.abs(this.tetherRotation[0]!) > DEG_89)
      this.tetherRotation[0] = DEG_89 * Math.sign(this.tetherRotation[0]!);

    this.tetherRotation[1]! = (this.tetherRotation[1] + yaw * this.sensitivity[1]) % 360;
    this.tetherRotation[2]! = (this.tetherRotation[2] + roll) % 360;
  }

  override tick(_data: TickData) {
    this.addRotation(
      _data.drag_movement[0] * _data.deltaTime,
      _data.drag_movement[1] * _data.deltaTime);

    if (this.spinEnabled)
      this.tetherRotation[0]! += this.spinSpeed * _data.deltaTime;
  }
}
