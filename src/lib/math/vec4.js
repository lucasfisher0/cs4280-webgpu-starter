/**
 * Minimal 4D vector utilities. Vectors are plain `[x, y, z, w]` arrays.
 * Mainly used as the operand/result of `mat4.multiplyVec4` (homogeneous
 * coordinates: points have `w = 1`, directions have `w = 0`).
 */

export function create(x = 0, y = 0, z = 0, w = 0) {
  return [x, y, z, w];
}

export function clone(a) {
  return [a[0], a[1], a[2], a[3]];
}

export function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}

export function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
}

export function scale(a, s) {
  return [a[0] * s, a[1] * s, a[2] * s, a[3] * s];
}

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

export function lerp(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ];
}
