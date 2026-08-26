/**
 * Generic texture upload/allocation plumbing. What you do with the
 * texture — sampling mode, filtering, mip generation strategy — is
 * assignment-specific and belongs in that assignment's renderer/shader.
 */

/**
 * Allocates a depth texture matching `width`/`height`, ready to be used as
 * a render pass's `depthStencilAttachment.view`. Pass the same
 * `sampleCount` you use for your color attachment (see
 * `createMultisampleColorTexture`) — WebGPU requires them to match.
 *
 * @param {GPUDevice} device
 * @param {number} width
 * @param {number} height
 * @param {GPUTextureFormat} [format]
 * @param {number} [sampleCount]
 * @returns {GPUTexture}
 */
export function createDepthTexture(device, width, height, format = "depth24plus", sampleCount = 1) {
  return device.createTexture({
    label: "depth-texture",
    size: { width: Math.max(1, width), height: Math.max(1, height) },
    format,
    sampleCount,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
}

/**
 * Allocates an offscreen multisampled color texture to render into when
 * doing MSAA: your pipeline's `multisample.count` must match `sampleCount`,
 * and the render pass's color attachment uses this texture's view as
 * `view` with the swap-chain texture's view as `resolveTarget`.
 *
 * @param {GPUDevice} device
 * @param {number} width
 * @param {number} height
 * @param {GPUTextureFormat} format typically the canvas's preferred format
 * @param {number} [sampleCount]
 * @returns {GPUTexture}
 */
export function createMultisampleColorTexture(device, width, height, format, sampleCount = 4) {
  return device.createTexture({
    label: "msaa-color-texture",
    size: { width: Math.max(1, width), height: Math.max(1, height) },
    format,
    sampleCount,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
}

/**
 * Uploads image pixel data (e.g. from `createImageBitmap`) into a new
 * `rgba8unorm` `GPUTexture`. Sampler creation (filter mode, address mode)
 * is left to the assignment that needs it — different assignments will
 * want different filtering.
 *
 * @param {GPUDevice} device
 * @param {ImageBitmap} bitmap
 * @param {string} [label]
 * @returns {GPUTexture}
 */
export function loadTextureFromImageBitmap(device, bitmap, label = "texture") {
  const texture = device.createTexture({
    label,
    size: { width: bitmap.width, height: bitmap.height },
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });
  device.queue.copyExternalImageToTexture(
    { source: bitmap },
    { texture },
    { width: bitmap.width, height: bitmap.height },
  );
  return texture;
}
