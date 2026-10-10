import {lookAt} from "@/lib/math/transforms.js";
import {type RenderTick, renderTickEvent} from "@/core/render/Render"
import {Entity} from "@/core/scenegraph/Entity";

// TODO: inherit from Entity
/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
export class Camera {
  tetherDistance: number = 5;
  spinSpeed: number = 0.2; // Speed to spin in radians/sec
  rotation: Float32Array = new Float32Array([0, 0, 0]);


  clipNear: number = 1;
  clipFar: number = 50;
  verticalFov: number = 1.0472; // 60 deg, vertical FoV

  /** Camera position derived from tether distance + yaw/pitch. */
  getPosition(): Float32Array {
    const yaw = this.rotation[0]!;
    const pitch = this.rotation[1]!;
    const r = this.tetherDistance;

    return new Float32Array([
      r * Math.cos(pitch) * Math.sin(yaw),
      r * Math.sin(pitch),
      r * Math.cos(pitch) * Math.cos(yaw)
    ]);
  }

  addRotation(yaw: number, pitch: number) {
    if (!this.rotation || this.rotation.length < 3)
      return;

    this.rotation[0]! += yaw;
    this.rotation[1]! += pitch;

    const DEG_89 = 1.55334303;
    if (Math.abs(this.rotation[1]!) > DEG_89)
      this.rotation[1] = DEG_89 * Math.sign(this.rotation[1]!);
  }

  getViewMatrix(target?: Float32Array) {
    target ??= new Float32Array([0, 0, 0]);

    return lookAt(
      this.getPosition(),
      target,
      new Float32Array([0, 1, 0]),
    );
  }

  tick(data: RenderTick) {
    this.rotation[0]! += this.spinSpeed * data.deltaTime;
  }
}
