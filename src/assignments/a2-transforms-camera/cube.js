// Interleaved [x, y, z]
export const CUBE_VERTICES = new Float32Array([
  0.0, 0.0, 0.0,
  1.0, 0.0, 0.0,
  0.0, 0.0, 1.0
]);

// Interleaved [x, y, z, r, g, b] in pairs, not triangles
export const AXIS_VERTICES = new Float32Array([
  0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
  1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
  0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
  0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
])
