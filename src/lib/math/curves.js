/**
 * Curve evaluation — Assignment 5's actual deliverable. Every function
 * below throws until you implement it; write a small manual test (a
 * degree-1 "curve" — two control points — should reduce to a plain lerp)
 * as you go.
 *
 * `controlPoints` is an array of equal-length points (`[x, y]` or
 * `[x, y, z]`); `t` is the curve parameter, normalized to `[0, 1]`.
 */

/** Direct Bernstein-polynomial evaluation — works for any control point count. */
export function evaluateBezier(_controlPoints, _t) {
  throw new Error("evaluateBezier: not implemented");
}

/**
 * De Casteljau's algorithm: repeatedly lerp between consecutive points
 * until only one remains. Equivalent to `evaluateBezier`, just computed by
 * recursive subdivision instead of the closed-form polynomial — useful for
 * visualizing the construction (each round's intermediate points trace out
 * progressively simpler curves).
 */
export function evaluateDeCasteljau(_controlPoints, _t) {
  throw new Error("evaluateDeCasteljau: not implemented");
}

/**
 * The curve's derivative (tangent vector, not normalized) at `t`. A degree
 * `n` Bézier curve's derivative is itself a degree `n-1` Bézier curve with
 * control points `n * (P[i+1] - P[i])` — build that derivative curve's
 * control points and reuse `evaluateBezier` on them, rather than a separate
 * closed-form formula. Used for the vehicle orientation: the tangent
 * direction points the way the vehicle should face while animating along
 * the curve.
 */
export function evaluateBezierTangent(_controlPoints, _t) {
  throw new Error("evaluateBezierTangent: not implemented");
}

/**
 * Precomputes a `t -> cumulative arc length` lookup table by sampling the
 * curve at `sampleCount` evenly spaced `t` values and summing straight-line
 * segment lengths between consecutive samples — a piecewise-linear
 * approximation of the true (generally non-closed-form) arc length.
 *
 * @returns {{ tValues: number[], lengths: number[], totalLength: number }}
 */
export function buildArcLengthTable(_controlPoints, _sampleCount = 100) {
  throw new Error("buildArcLengthTable: not implemented");
}

/**
 * Arc-length parameterization: maps a target distance traveled *along the
 * curve* back to the `t` that reaches it, by binary-searching `table` for
 * the bracketing pair of samples and linearly interpolating between them.
 * Stepping `targetLength` at a constant rate (rather than stepping `t`
 * directly) is what makes motion along the curve read as constant-speed,
 * even though `t` itself doesn't advance at a uniform rate over an
 * unevenly-spaced control polygon.
 */
export function tAtArcLength(_table, _targetLength) {
  throw new Error("tAtArcLength: not implemented");
}
