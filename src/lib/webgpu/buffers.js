/**
 * Small conveniences around `GPUBuffer` creation. These are generic
 * plumbing (allocate + upload), not rendering logic — what you put in the
 * buffers, and how your pipeline interprets them, is up to each assignment.
 */

/**
 * Creates a `GPUBuffer` sized to `data` and immediately uploads `data` into
 * it. `data` should be a `TypedArray` (e.g. `Float32Array`, `Uint16Array`).
 *
 * @param {GPUDevice} device
 * @param {ArrayBufferView} data
 * @param {GPUBufferUsageFlags} usage e.g. `GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST`
 * @param {string} [label]
 * @returns {GPUBuffer}
 */
export function createBuffer(device, data, usage, label) {
  // WebGPU requires buffer sizes to be a multiple of 4 bytes.
  const alignedSize = Math.ceil(data.byteLength / 4) * 4;
  const buffer = device.createBuffer({
    label,
    size: alignedSize,
    usage,
    mappedAtCreation: true,
  });
  new Uint8Array(buffer.getMappedRange()).set(
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
  );
  buffer.unmap();
  return buffer;
}

/**
 * Writes `data` into an existing buffer at `offset` bytes. Use this inside
 * a render/animation loop to update a buffer (e.g. a uniform MVP matrix)
 * without reallocating it every frame.
 *
 * @param {GPUDevice} device
 * @param {GPUBuffer} buffer
 * @param {ArrayBufferView} data
 * @param {number} [offset]
 */
export function writeBuffer(device, buffer, data, offset = 0) {
  device.queue.writeBuffer(buffer, offset, data.buffer, data.byteOffset, data.byteLength);
}
