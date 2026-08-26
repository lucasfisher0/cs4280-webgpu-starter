/**
 * Configures a `<canvas>`'s `webgpu` context to present frames rendered by
 * `device`, using the browser's preferred swap-chain format.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {GPUDevice} device
 * @param {GPUTextureFormat} format
 * @param {GPUCanvasAlphaMode} [alphaMode]
 * @returns {GPUCanvasContext}
 */
export function configureContext(canvas, device, format, alphaMode = "opaque") {
  const context = canvas.getContext("webgpu");
  if (!context) {
    throw new Error("This canvas does not support a 'webgpu' context.");
  }
  context.configure({ device, format, alphaMode });
  return context;
}

/**
 * The format the browser recommends for canvases presented via WebGPU.
 * Prefer this over hardcoding `"bgra8unorm"` so the app matches whatever
 * the platform compositor expects.
 */
export function getPreferredCanvasFormat() {
  return navigator.gpu.getPreferredCanvasFormat();
}
