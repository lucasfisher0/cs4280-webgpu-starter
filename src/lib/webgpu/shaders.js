/**
 * Wraps `device.createShaderModule`, tagging errors from WGSL compilation
 * with the shader's label so a syntax error in `shaders.wgsl` points you
 * back to the right file instead of a generic console message.
 *
 * @param {GPUDevice} device
 * @param {string} code WGSL source, typically imported via `?raw`:
 *   `import code from "./shaders.wgsl?raw"`
 * @param {string} [label]
 * @returns {GPUShaderModule}
 */
export function createShaderModule(device, code, label = "shader") {
  const module = device.createShaderModule({ label, code });
  if (module.getCompilationInfo) {
    module.getCompilationInfo().then((info) => {
      for (const message of info.messages) {
        const location = `${label}:${message.lineNum}:${message.linePos}`;
        if (message.type === "error") {
          console.error(`[WGSL error] ${location} — ${message.message}`);
        } else if (message.type === "warning") {
          console.warn(`[WGSL warning] ${location} — ${message.message}`);
        }
      }
    });
  }
  return module;
}
