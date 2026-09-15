/**
 * Transform-matrix construction — Assignment 2's actual deliverable. Every
 * function below throws until you implement it. All matrices are
 * column-major `Float32Array(16)` (see `mat4.js`).
 */
import {multiply} from "@/lib/math/mat4.js";

export function translate(_tx, _ty, _tz) {
  return new Float32Array([
    1, 0, 0, _tx,
    0, 1, 0, _ty,
    0, 0, 1, _tz,
    0, 0, 0, 1,
  ]);
}

export function scale(_sx, _sy, _sz) {
  return new Float32Array([
    _sx, 0,   0,   0,
    0,   _sy, 0,   0,
    0,   0,   _sz, 0,
    0,   0,   0,   1,
  ]);
}


export function shear(_xy, _xz, _yx, _yz, _zx, _zy) {
  // shear takes all 6 off-diagonal coefficients (xy, xz, yx, yz, zx, zy); each displaces
  // one axis by a multiple of another (e.g. xy shifts X by xy * y).
  // Leave the rest at 0 for a single-axis shear.

  throw new Error("shear: not implemented");
  return new Float32Array([
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 1,
  ]);
}

export function rotateX(_radians) {
  const c = Math.cos(_radians);
  const s = Math.sin(_radians);

  return new Float32Array([
    1, 0,  0, 0,
    0, c, -s, 0,
    0, s,  c, 0,
    0, 0,  0, 1,
  ]);
}

export function rotateY(_radians) {
  const c = Math.cos(_radians);
  const s = Math.sin(_radians);

  return new Float32Array([
    c, 0, s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ]);
}

export function rotateZ(_radians) {
  const c = Math.cos(_radians);
  const s = Math.sin(_radians);

  return new Float32Array([
    c, -s, 0, 0,
    s,  c, 0, 0,
    0,  0, 0, 0,
    0,  0, 0, 1,
  ]);
}

/** A view matrix placing the camera at `eye`, looking toward `target`. */
export function lookAt(_eye, _target, _up) {
  // T(c)R
  throw new Error("lookAt: not implemented");
}

/**
 * A perspective projection matrix for WebGPU's `z` in `[0, 1]` clip-space
 * depth range (unlike OpenGL's `[-1, 1]`).
 */
export function perspective(_fovYRadians, _aspect, _near, _far) {
  throw new Error("perspective: not implemented");
}

// Intrinsic Z-Y-X Euler angles (yaw * pitch * roll) — a common convention
// and a direct source of gimbal lock when pitch approaches +/-90 degrees.
export function fromEulerZYX(_yaw, _pitch, _roll) {
  return multiply(rotateZ(_yaw), multiply(rotateY(_pitch), rotateX(_roll)));
}

/** An orthographic projection matrix, same `z` in `[0, 1]` convention as `perspective`. */
export function ortho(_left, _right, _bottom, _top, _near, _far) {
  throw new Error("ortho: not implemented");
}
