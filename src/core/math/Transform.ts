import * as JSTransforms from "@/lib/math/transforms.js";
import {Vec3} from "@/core/math/Vec3.ts";
import {Mat4} from "@/core/math/Mat4.ts";

export function translate(_tx: number, _ty: number, _tz: number): Mat4 {
  return new Mat4(JSTransforms.translate(_tx, _ty, _tz));
}

export function scale(_sx: number, _sy: number, _sz: number): Mat4 {
  return new Mat4(JSTransforms.scale(_sx, _sy, _sz));
}

/** @deprecated Prevents extraction of TRS from node transforms and must be accounted for. */
export function shear(_xy: number, _xz: number, _yx: number,
  _yz: number, _zx: number, _zy: number): Mat4 {
  return new Mat4(JSTransforms.shear(_xy, _xz, _yx, _yz, _zx, _zy));
}

// Rotations
export function rotateX(_radians: number): Mat4 {
  return new Mat4(JSTransforms.rotateX(_radians));
}
export function rotateY(_radians: number): Mat4 {
  return new Mat4(JSTransforms.rotateY(_radians));
}
export function rotateZ(_radians: number): Mat4 {
  return new Mat4(JSTransforms.rotateZ(_radians));
}
export function fromEulerZYX(_yaw: number, _pitch: number, _roll: number): Mat4 {
  return new Mat4(JSTransforms.fromEulerZYX(_yaw, _pitch, _roll));
}

// View Operations
export function lookAt(_eye: Vec3, _target: Vec3, _up: Vec3): Mat4 {
  return new Mat4(JSTransforms.lookAt(_eye.toArray(), _target.toArray(), _up.toArray()));

}
export function perspective(_fovYRadians: number, _aspect: number, _near: number, _far: number): Mat4 {
  return new Mat4(JSTransforms.perspective(_fovYRadians, _aspect, _near, _far));
}
export function ortho(_left: number, _right: number, _bottom: number, _top: number,
  _near: number, _far: number): Mat4 {
  return new Mat4(JSTransforms.ortho(_left, _right, _bottom, _top, _near, _far));
}
