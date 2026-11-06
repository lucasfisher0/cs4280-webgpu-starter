import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"

import {SceneNode, type SceneNodeDescriptor} from "@/core/scenegraph/SceneNode";
import {InputManager} from "@/core/InputManager.ts";

/* export enum FOV_TYPE {
  HORIZONTAL,
  VERTICAL,
  DEGREES,
  RADIANS
} // TODO: use these to support setting FOV in any format
*/

interface CameraNodeDescriptor extends SceneNodeDescriptor {
  sensitivity?: Vec2;
  tetherDistance?: number;
  spinSpeed?: number;
  spinEnabled?: boolean;
  clipNear?: number;
  clipFar?: number;
  fov?: number;
  canvasId: string;
}
export type {CameraNodeDescriptor};

/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
export class Camera extends SceneNode {
  sensitivity: Vec2;
  tetherDistance: number;
  tetherRotation: Vec3 = new Vec3(0, 0, 0);
  spinSpeed: number;
  spinEnabled: boolean;
  clipNear: number;
  clipFar: number;
  verticalFov: number;
  moveSpeed: number = 0.1;
  moveSpeedMultiplier: number = 3; // Shift multiplier for move speed

  static activeCamera: Camera | null = null;
  canvasId: string; // Currently no safety-- this should not be changed while input is bound

  constructor(desc: CameraNodeDescriptor) {
    super(desc);

    this.sensitivity = desc.sensitivity ?? new Vec2(0.1);
    this.tetherDistance = desc.tetherDistance ?? 0;
    this.spinSpeed = desc.spinSpeed ?? 0.2; // Spin speed in rad/s
    this.spinEnabled = desc.spinEnabled ?? false;

    this.clipNear = desc.clipNear ?? 1;
    this.clipFar = desc.clipFar ?? 50;
    this.verticalFov = desc.fov ?? 1.0472; // 60 deg, vertical FoV
    this.canvasId = desc.canvasId;

    if (Camera.activeCamera == null)
      this.setActive();
  }

  setActive(): Camera {
    if (Camera.activeCamera && Camera.activeCamera != this)
      Camera.activeCamera.unregisterInput();

    Camera.activeCamera = this;
    this.registerInput(this.canvasId!);
    return this;
  }

  pointer_pos: PointerPosition | null = null;
  pointer_last: PointerPosition | null = null;
  dragging = false;

  registerInput(canvasId?: string) {
    this.canvasId = canvasId ?? this.canvasId;
    if (this.canvasId == null) {
      console.error("Cannot register camera input without a provided canvas ID.");
      return;
    }

    InputManager.registerPointer(canvasId as string, this.onPointerInput);
  }

  unregisterInput() {
    InputManager.unregisterPointer(this.canvasId as string);
    // TODO: InputManager needs to be able to unregister keyboard callbacks
  }

  onPointerInput(event: PointerEvent) {
    if (event.type === "pointerdown") {
      console.log("Camera: Pointer down!");
      this.pointer_pos = [event.clientX, event.clientY];
      this.dragging = true;
    } else if (event.type === "pointerup") {
      this.dragging = false;
      this.pointer_last = null;
    } else if (event.type === "pointercancel") {
      this.dragging = false;
      this.pointer_last = null;
    } else if (event.type === "pointermove") {
      this.pointer_pos = [event.clientX, event.clientY];
    }
  }

  /** Returns camera position, including the boom. */
  getCameraPosition(): Vec3 {
    if (this.tetherDistance <= 0)
      return this.worldTransform.position();

    // Compose the real node position with the camera boom
    let origin: Mat4 = super.worldTransform;
    let tether: Mat4 = Mat4.multiply(
      Transform.fromEulerZYX(this.tetherRotation.z, this.tetherRotation.y, this.tetherRotation.x),
      Transform.translate(0, 0, -this.tetherDistance)
    );

    return Mat4.multiply(tether, origin).position();
  }

  /** Returns forward vector for this camera. */
  getForwardVector(): Vec3 {
    const rot = this.tetherRotation;
    const f = new Vec3(
      Math.cos(rot.x) * Math.sin(rot.y),
      Math.sin(rot.x),
      Math.cos(rot.x) * Math.cos(rot.y)
    );
    return f.normalize();
  }

  /** Returns right vector for this camera. */
  getRightVector(_up?: Vec3): Vec3 {
    const f = this.getForwardVector();
    const r = Vec3.cross(f, _up ?? new Vec3(0, 1, 0));
    return r.normalize();
  }

  /** Returns camera view matrix. **/
  getViewMatrix(target?: Vec3) {
    return Transform.lookAt(
      this.getCameraPosition(),
      target ?? Vec3.add(this.getCameraPosition(), this.getForwardVector()),
      new Vec3(0, 1, 0)
    );
  }

  /** Adds rotation in radian components of yaw/pitch/roll. **/
  addRotation(yaw: number, pitch: number, roll: number = 0) {
    // Pitch w/ Clamp
    this.tetherRotation.x += pitch * this.sensitivity.x;
    const DEG_89 = 1.55334303;
    if (Math.abs(this.tetherRotation.x) > DEG_89)
      this.tetherRotation.x = DEG_89 * Math.sign(this.tetherRotation.x);

    this.tetherRotation.y = (this.tetherRotation.y + yaw * this.sensitivity.y) % 360;
    this.tetherRotation.z = (this.tetherRotation.z + roll) % 360;
  }

  addMovement(move: Vec2) {
    const f = this.getForwardVector();
    const r = this.getRightVector();

    let translate = Mat4.multiply(
      Transform.translateVec3(Vec3.scale(r, move.y)),
      Transform.translateVec3(Vec3.scale(f, move.x)));

    this.transform = Mat4.multiply(
      translate,
      this.transform
    );
  }

  override tick(_dt: number) {
    if (this.spinEnabled)
      this.tetherRotation.y += this.spinSpeed * _dt;

    // Dragging - Camera rotation and movement
    if (this.dragging)
      // Camera rotation
      if (this.pointer_pos) {
        if (this.pointer_last) {
          let drag_movement: PointerPosition = [
            this.pointer_pos[0]! - this.pointer_last[0]!,
            this.pointer_pos[1]! - this.pointer_last[1]!];

          this.addRotation(
            drag_movement[0] * _dt,
            drag_movement[1] * _dt);
        }
        this.pointer_last = this.pointer_pos;
      }

    // Camera Movement
    let moveInput = Vec2.Zero();
    moveInput.x += Number(InputManager.isKeyDown("d"));
    moveInput.x -= Number(InputManager.isKeyDown("a"));
    moveInput.y += Number(InputManager.isKeyDown("w"));
    moveInput.y -= Number(InputManager.isKeyDown("s"));
    if (moveInput.x != 0 || moveInput.y != 0) {
      moveInput.normalize();
      const distance = this.moveSpeed * _dt * (this.moveSpeedMultiplier * Number(InputManager.isShiftDown))
      this.addMovement(Vec2.scale(moveInput, distance));
    }
  }
}
