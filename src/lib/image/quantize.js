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
  const stepSize = Math.round(255 / _levels);

  const step = Math.round(_value / stepSize);
  return Math.min(step * stepSize, 255);
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
  const pixels = new Uint8ClampedArray(_imageData.data);

  for (let i = 0; i < pixels.length; i++) {
    if ((i + 1) % 4 === 0)
      // Skip alpha channel
      continue;

    pixels[i] = quantizeChannel(pixels[i], _levelsPerChannel);
  }

  return new ImageData(pixels, _imageData.width, _imageData.height);
}
