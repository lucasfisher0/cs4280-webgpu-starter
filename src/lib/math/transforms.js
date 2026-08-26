/**
 * Transform-matrix construction — Assignment 2's actual deliverable. Every
 * function below throws until you implement it. All matrices are
 * column-major `Float32Array(16)` (see `mat4.js`).
 */

export function translate(_tx, _ty, _tz) {
  throw new Error("translate: not implemented");
}

export function scale(_sx, _sy, _sz) {
  throw new Error("scale: not implemented");
}

export function rotateX(_radians) {
  throw new Error("rotateX: not implemented");
}

export function rotateY(_radians) {
  throw new Error("rotateY: not implemented");
}

export function rotateZ(_radians) {
  throw new Error("rotateZ: not implemented");
}

/** A view matrix placing the camera at `eye`, looking toward `target`. */
export function lookAt(_eye, _target, _up) {
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
  throw new Error("fromEulerZYX: not implemented");
}

/** An orthographic projection matrix, same `z` in `[0, 1]` convention as `perspective`. */
export function ortho(_left, _right, _bottom, _top, _near, _far) {
  throw new Error("ortho: not implemented");
}
