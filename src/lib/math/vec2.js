/**
 * Minimal 2D vector utilities. Vectors are plain `[x, y]` arrays so they are
 * trivial to log, destructure, and pass into typed arrays for GPU buffers.
 */

export function create(x = 0, y = 0) {
  return [x, y];
}

export function clone(a) {
  return [a[0], a[1]];
}

export function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scale(a, s) {
  return [a[0] * s, a[1] * s];
}

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

export function length(a) {
  return Math.hypot(a[0], a[1]);
}

export function normalize(a) {
  const len = length(a);
  if (len === 0) return [0, 0];
  return [a[0] / len, a[1] / len];
}

export function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function negate(a) {
  return [-a[0], -a[1]];
}
