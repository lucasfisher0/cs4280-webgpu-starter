/**
 * Uniform color quantization ("posterize") — part of Assignment 1's
 * deliverable. Each channel is snapped to one of `levels` evenly spaced
 * values, independent of image content. This is the simplest lossy
 * technique in Assignment 1 — contrast it with `palette.js`'s indexed-color
 * approach, which instead picks a small set of colors *tailored to the
 * image*. Every function below throws until you implement it.
 */

/** Snaps one 0-255 channel value to the nearest of `levels` evenly spaced steps. */
export function quantizeChannel(_value, _levels) {
  throw new Error("quantizeChannel: not implemented");
}

/**
 * Returns a new `ImageData` with every R/G/B channel uniformly quantized
 * to `levelsPerChannel` levels (alpha is left untouched).
 *
 * @param {ImageData} imageData
 * @param {number} levelsPerChannel
 * @returns {ImageData}
 */
export function posterizeChannels(_imageData, _levelsPerChannel) {
  throw new Error("posterizeChannels: not implemented");
}
