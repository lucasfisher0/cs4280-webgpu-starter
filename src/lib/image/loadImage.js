/**
 * Turns a `File` (or an existing canvas/bitmap) into `ImageData`, capping
 * its largest dimension along the way. The palette/block-average
 * algorithms in this app are plain nested-loop JS re-run on every slider
 * tweak, not GPU compute — capping resolution keeps them interactive on a
 * user-supplied photo without needing to optimize the algorithms
 * themselves (which would obscure how they work).
 */

export const MAX_WORKING_DIMENSION = 320;

function drawToImageData(source, sourceWidth, sourceHeight, maxDimension) {
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

/** @param {File} file @param {number} [maxDimension] @returns {Promise<ImageData>} */
export async function loadImageDataFromFile(file, maxDimension = MAX_WORKING_DIMENSION) {
  const bitmap = await createImageBitmap(file);
  try {
    return drawToImageData(bitmap, bitmap.width, bitmap.height, maxDimension);
  } finally {
    bitmap.close();
  }
}

/** @param {HTMLCanvasElement | ImageBitmap} source @param {number} [maxDimension] @returns {ImageData} */
export function imageDataFromSource(source, maxDimension = MAX_WORKING_DIMENSION) {
  return drawToImageData(source, source.width, source.height, maxDimension);
}
