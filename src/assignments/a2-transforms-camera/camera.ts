import {lookAt, translate} from "@/lib/math/transforms.js";
import {identity, multiply} from "@/lib/math/mat4.js";
import {fromEulerZYX} from "@/lib/math/transforms.js";

/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
export class Camera {
  tetherDistance: number = 5;
  rotation: Float32Array = new Float32Array([0, 0, 0]);
  spinSpeed: number = 0.2; // Speed to spin in radians/sec

  clipNear: number = 0.1;
  clipFar: number  = 100.0;
  verticalFov: number = 1.0472; // 60 deg, vertical FoV

  getPosition(): Float32Array {
    // TODO: FIXME
    return new Float32Array([0, 0, -this.tetherDistance]);

    // This should return vec3 coordinates instead of a matrix
    let position = translate(0, 0, -this.tetherDistance);
    return multiply(position, fromEulerZYX(this.rotation[0], this.rotation[1], this.rotation[2]));
  }

  addRotation(yaw: number, pitch: number) {
    this.rotation[0] += yaw;
    this.rotation[1] += pitch;

    const DEG_89 = 1.55334303;
    if(Math.abs(this.rotation[1]) > DEG_89)
      this.rotation[1] = DEG_89 * Math.sign(this.rotation[1]);
  }

  tick(deltaTime: number) {
    this.rotation[0] += this.spinSpeed * deltaTime;
  }
}
