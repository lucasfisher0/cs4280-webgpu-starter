/**
 * Transform-matrix construction — Assignment 2's actual deliverable. Every
 * function below throws until you implement it. All matrices are
 * column-major `Float32Array(16)` (see `mat4.js`).
 */
import * as Mat4 from "@/lib/math/mat4.js";
import * as Vec3 from "@/lib/math/vec3.js";
import * as Vec4 from "@/lib/math/vec4.js";

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
  return new Float32Array([
    1,    _xy,  _xz,  0,
    _yx,  1,    _yz,  0,
    _zx,  _zy,  1,    0,
    0,    0,    0,    1,
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
    -s, 0, c, 0,
     0, 0, 0, 1,
  ]);
}

export function rotateZ(_radians) {
  const c = Math.cos(_radians);
  const s = Math.sin(_radians);

  return new Float32Array([
    c, -s, 0, 0,
    s,  c, 0, 0,
    0,  0, 1, 0,
    0,  0, 0, 1,
  ]);
}

/** A view matrix placing the camera at `eye`, looking toward `target`. */
export function lookAt(_eye, _target, _up) {
  // Construct Camera Basis
  const f = Vec3.normalize(Vec3.sub(_target, _eye));
  const r = Vec3.normalize(Vec3.cross(f, _up));
  const u = Vec3.cross(r, f);

  return new Float32Array([
     r[0],   r[1],  r[2], -Vec3.dot(r, _eye),
     u[0],   u[1],  u[2], -Vec3.dot(u, _eye),
    -f[0],  -f[1], -f[2],  Vec3.dot(f, _eye),
     0,      0,     0,     1,
  ]);
}

/**
 * A perspective projection matrix for WebGPU's `z` in `[0, 1]` clip-space
 * depth range (unlike OpenGL's `[-1, 1]`).
 */
export function perspective(_fovYRadians, _aspect, _near, _far) {
  const s = 1 / (Math.tan(_fovYRadians / 2));
  return new Float32Array([
    s/_aspect,    0,      0,                   0,
    0,            s,      0,                   0,
    0,            0,      _far/(_near-_far),   (_far*_near)/(_near-_far),
    0,            0,      -1,                  0,
  ]);
}

// Intrinsic Z-Y-X Euler angles (yaw * pitch * roll) — a common convention
// and a direct source of gimbal lock when pitch approaches +/-90 degrees.
export function fromEulerZYX(_yaw, _pitch, _roll) {
  return Mat4.multiplyAll([rotateX(_roll), rotateY(_pitch), rotateZ(_yaw)]);
}

/** An orthographic projection matrix, same `z` in `[0, 1]` convention as `perspective`. */
export function ortho(_left, _right, _bottom, _top, _near, _far) {
  return new Float32Array([
    2/(_right-_left), 0,                     0,                 -(_right+_left)/(_right-_left),
    0,                2/(_top-_bottom),      0,                 -(_top+_bottom)/(_top-_bottom),
    0,                0,                     1/(_near-_far),    _near/(_near-_far),
    0,                0,                     0,                 1,
  ]);
}
