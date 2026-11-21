

/*
  This file was written before the WebGPU folder was consolidated into a single JS file.
  Unless I encounter issues with it, I will avoid doing more work to utilize the new
  provided files.
 */
interface WebGPUResponse {
  canvas: HTMLCanvasElement;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}
export type {WebGPUResponse};

export async function initializeWebGPU(canvasId: string): Promise<WebGPUResponse> {
  const canvas = document.getElementById(canvasId)! as HTMLCanvasElement;
  if (!canvas)
    throw new Error(`Canvas element with ID "${canvasId}" was not found.`);
  if (!navigator.gpu)
    throw new Error("WebGPU is not supported in this browser.");

  let adapter = await navigator.gpu.requestAdapter();
  if (!adapter)
    adapter = await navigator.gpu.requestAdapter({ forceFallbackAdapter: true });
  if (!adapter)
    throw new Error("No compatible GPU adapter found. Check if hardware acceleration is enabled.");

  const device = await adapter.requestDevice();

  const context = canvas.getContext("webgpu");
  if (!context) {
    throw new Error("Failed to get WebGPU context from canvas.");
  }

  const format = navigator.gpu.getPreferredCanvasFormat();

  // Canvas pixel dimensions are sized by createAttachmentManager, which
  // also owns resizing — sizing it here too would duplicate that logic
  // and risk skipping the attachment manager's first-run allocation.
  context.configure({
    device,
    format,
    alphaMode: "premultiplied"
  });

  return {canvas, device, context, format};
}

interface AttachmentManager {
  getDepthView(): GPUTextureView;
  getAspect() : number;
}
export type {AttachmentManager};

/**
 * 3. Render Attachment Manager: Handles High-DPI canvas scaling and depth textures.
 */
export function createAttachmentManager(canvas: HTMLCanvasElement, device: GPUDevice): AttachmentManager {
  let depthTexture: GPUTexture | null = null;

  function update() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
    const height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));

    // Also recreate when depthTexture is still null: if the canvas
    // already happened to have these exact pixel dimensions on the first
    // call, the size-changed check alone would never allocate it.
    if (!depthTexture || canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      if (depthTexture) depthTexture.destroy();
      depthTexture = device.createTexture({
        size: [width, height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
    }
  }

  update();
  window.addEventListener('resize', update);

  return {
    getDepthView: () => depthTexture!.createView(),
    getAspect: () => canvas.width / canvas.height,
  };
}

export class FColor {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number = 1.0)
  { }
}

export type FrameLoop = (renderPass: GPURenderPassEncoder, dt: number, aspect: number, time: number) => void;

/**
 * Executes a continuous animation loop, managing canvas sizing,
 * render passes, frame timing, and submission.
 */
export function animate(
  canvas: HTMLCanvasElement,
  device: GPUDevice,
  context: GPUCanvasContext,
  fpsElementId: string | null = null,
  clearColor: FColor | null = null,
  onFrame: FrameLoop) {
  const attachments = createAttachmentManager(canvas, device);
  const fpsLabel = fpsElementId ? document.getElementById(fpsElementId) : null;

  let lastTime = performance.now();
  let frames = 0;
  let lastFpsTime = performance.now();

  function loop(now: number) {
    const dt = (now - lastTime) * 0.001;
    lastTime = now;

    frames++;
    if (fpsLabel && now - lastFpsTime >= 500) {
      fpsLabel.textContent = `FPS: ${Math.round((frames * 1000) / (now - lastFpsTime))}`;
      frames = 0;
      lastFpsTime = now;
    }

    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: clearColor ?? new FColor(0.05, 0.05, 0.05),
        loadOp: 'clear',
        storeOp: 'store',
      }],
      depthStencilAttachment: {
        view: attachments.getDepthView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    onFrame(
      renderPass,
      dt,
      attachments.getAspect(),
      now * 0.001
    );

    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
