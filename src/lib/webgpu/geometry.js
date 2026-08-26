/**
 * Generic mesh data generators — authoring vertex data by hand is grunt
 * work, not a graphics algorithm, so this is provided infrastructure (used
 * starting Assignment 2 to have *something* to apply transforms/lighting/
 * texturing to). Each face has its own 4 vertices (24 total) so per-face
 * normals and UVs work correctly; indices reuse them per triangle.
 */

const CUBE_FACES = [
  { normal: [1, 0, 0], right: [0, 0, -1], up: [0, 1, 0] }, // +X
  { normal: [-1, 0, 0], right: [0, 0, 1], up: [0, 1, 0] }, // -X
  { normal: [0, 1, 0], right: [1, 0, 0], up: [0, 0, -1] }, // +Y
  { normal: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1] }, // -Y
  { normal: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] }, // +Z
  { normal: [0, 0, -1], right: [-1, 0, 0], up: [0, 1, 0] }, // -Z
];

const CORNER_SIGNS = [
  [-1, -1, 0, 0],
  [1, -1, 1, 0],
  [1, 1, 1, 1],
  [-1, 1, 0, 1],
];

/**
 * @param {number} [size] edge length of the cube
 * @returns {{ positions: Float32Array, normals: Float32Array, uvs: Float32Array, indices: Uint16Array, vertexCount: number, indexCount: number }}
 */
export function createCubeGeometry(size = 1) {
  const h = size / 2;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (const { normal, right, up } of CUBE_FACES) {
    const base = positions.length / 3;
    for (const [rSign, uSign, u, v] of CORNER_SIGNS) {
      positions.push(
        right[0] * rSign * h + up[0] * uSign * h + normal[0] * h,
        right[1] * rSign * h + up[1] * uSign * h + normal[1] * h,
        right[2] * rSign * h + up[2] * uSign * h + normal[2] * h,
      );
      normals.push(normal[0], normal[1], normal[2]);
      uvs.push(u, v);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    vertexCount: positions.length / 3,
    indexCount: indices.length,
  };
}

/**
 * Un-indexes an indexed mesh and recomputes one flat (per-triangle) normal
 * for each of its 3 duplicated vertices, discarding whatever normals it
 * had before — used by Assignment 4 to render the *same* mesh (e.g. a
 * shared-vertex sphere, normally smooth-shaded) with faceted flat shading
 * for comparison. The result has no index buffer: draw it with `draw()`
 * instead of `drawIndexed()`.
 *
 * @param {{ positions: Float32Array, uvs?: Float32Array, indices: Uint16Array | Uint32Array }} mesh
 * @returns {{ positions: Float32Array, normals: Float32Array, uvs?: Float32Array, vertexCount: number }}
 */
export function flattenGeometry(mesh) {
  const { positions, uvs, indices } = mesh;
  const triangleCount = indices.length / 3;
  const outPositions = new Float32Array(triangleCount * 9);
  const outNormals = new Float32Array(triangleCount * 9);
  const outUvs = uvs ? new Float32Array(triangleCount * 6) : undefined;

  for (let t = 0; t < triangleCount; t++) {
    const triangleIndices = [indices[t * 3], indices[t * 3 + 1], indices[t * 3 + 2]];
    const [a, b, c] = triangleIndices.map((i) => positions.subarray(i * 3, i * 3 + 3));

    const abX = b[0] - a[0];
    const abY = b[1] - a[1];
    const abZ = b[2] - a[2];
    const acX = c[0] - a[0];
    const acY = c[1] - a[1];
    const acZ = c[2] - a[2];
    const nx = abY * acZ - abZ * acY;
    const ny = abZ * acX - abX * acZ;
    const nz = abX * acY - abY * acX;
    const length = Math.hypot(nx, ny, nz) || 1;
    const normal = [nx / length, ny / length, nz / length];

    const corners = [a, b, c];
    for (let v = 0; v < 3; v++) {
      const outBase = (t * 3 + v) * 3;
      outPositions.set(corners[v], outBase);
      outNormals.set(normal, outBase);
      if (outUvs) {
        const sourceIndex = triangleIndices[v];
        outUvs.set(uvs.subarray(sourceIndex * 2, sourceIndex * 2 + 2), (t * 3 + v) * 2);
      }
    }
  }

  return {
    positions: outPositions,
    normals: outNormals,
    uvs: outUvs,
    vertexCount: triangleCount * 3,
  };
}

/**
 * A standard latitude/longitude UV sphere, centered at the origin. Since
 * every vertex sits on the sphere, its normal is just its position
 * normalized — no per-face duplication needed the way the cube has.
 *
 * @param {number} [radius]
 * @param {number} [latitudeBands] rings from pole to pole
 * @param {number} [longitudeBands] segments around the equator
 * @returns {{ positions: Float32Array, normals: Float32Array, uvs: Float32Array, indices: Uint16Array, vertexCount: number, indexCount: number }}
 */
export function createSphereGeometry(radius = 1, latitudeBands = 24, longitudeBands = 24) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let lat = 0; lat <= latitudeBands; lat++) {
    const theta = (lat * Math.PI) / latitudeBands; // 0 (top pole) to PI (bottom pole)
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= longitudeBands; lon++) {
      const phi = (lon * 2 * Math.PI) / longitudeBands; // 0 to 2*PI around the equator
      const x = Math.cos(phi) * sinTheta;
      const y = cosTheta;
      const z = Math.sin(phi) * sinTheta;

      positions.push(radius * x, radius * y, radius * z);
      normals.push(x, y, z);
      uvs.push(lon / longitudeBands, lat / latitudeBands);
    }
  }

  for (let lat = 0; lat < latitudeBands; lat++) {
    for (let lon = 0; lon < longitudeBands; lon++) {
      const a = lat * (longitudeBands + 1) + lon;
      const b = a + longitudeBands + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    vertexCount: positions.length / 3,
    indexCount: indices.length,
  };
}
