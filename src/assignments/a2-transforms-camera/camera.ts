import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"

/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
export class Camera {
  tetherDistance: number = 5;
  rotation: Float32Array = new Float32Array([0, 0, 0]);
  spinSpeed: number = 0.2; // Speed to spin in radians/sec

  clipNear: number = 1;
  clipFar: number  = 50;
  verticalFov: number = 1.0472; // 60 deg, vertical FoV

  /** Camera position derived from tether distance + yaw/pitch. */
  getPosition(): Vec3 {
    const yaw: number = this.rotation[0] ?? 0;
    const pitch: number = this.rotation[1] ?? 0;
    const r = this.tetherDistance;

    return new Vec3(
      r * Math.cos(pitch) * Math.sin(yaw),
      r * Math.sin(pitch),
      r * Math.cos(pitch) * Math.cos(yaw)
    );
  }

  addRotation(yaw: number, pitch: number) {
    if (!this.rotation || this.rotation.length < 3)
      return;

    this.rotation[0]! += yaw;
    this.rotation[1]! += pitch;

    const DEG_89 = 1.55334303;
    if(Math.abs(this.rotation[1]!) > DEG_89)
      this.rotation[1] = DEG_89 * Math.sign(this.rotation[1]!);
  }

  getViewMatrix(target?: Vec3) {
    target ??= Vec3.Zero();

    return Transform.lookAt(
      this.getPosition(),
      target,
      new Vec3(0, 1, 0)
    );
  }

  tick(deltaTime: number) {
    this.rotation[0]! += this.spinSpeed * deltaTime;
  }
}
