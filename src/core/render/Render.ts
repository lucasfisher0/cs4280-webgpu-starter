import {configureContext, getPreferredCanvasFormat} from "@/lib/webgpu/context";


import {Material, DEFAULT_MATERIAL} from "@/core/render/Material";
// import {Model} from "@/core/render/Model";
import {createShaderModule} from "@/lib/webgpu/shaders";
import {SceneNode} from "@/core/scenegraph/SceneNode.ts";
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"

type MaterialGroup = [id: string, shader: string, buffer: GPUBuffer, bindGroup: GPUBindGroup];

const tickData: TickData = {deltaTime: 0.0, drag_movement: [0.0, 0.0]};
export const renderTickEvent = new CustomEvent<TickData>("tick", {
  detail: tickData,
  bubbles: true
});


export class Renderer implements Disposable {
  // WebGPU
  device: GPUDevice | null = null;
  format: GPUTextureFormat | null = null;
  context: GPUCanvasContext | null = null;

  // Canvas
  #canvas: HTMLCanvasElement | null = null;
  #abortController = new AbortController(); // Can be used to remove listeners
  pointer_pos: number[] | null = null;
  pointer_last: number[] | null = null;
  dragging = false;

  // Scene Graph
  scene: SceneNode = new SceneNode({
    name: "root",
    translation: Mat4.Identity(),
    rotation: Mat4.Identity(),
    scale: Mat4.Identity()
  });

  constructor(device: GPUDevice, canvas: HTMLCanvasElement) {
    this.device = device;
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.setCanvas(canvas);

    // Uniform Buffer
    const UNIFORM_SIZE: number = 16 * 4;
    device.pushErrorScope('validation');
    let uniformBuffer: GPUBuffer = device.createBuffer({
      label: "transform-uniform",
      size: UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.popErrorScope().then(e => e && console.error('uniform buffer error:', e.message));

    const bindGroupLayout: GPUBindGroupLayout = device.createBindGroupLayout({
      label: "u-layout",
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {type: "uniform"}
      }]
    });

    device.pushErrorScope('validation');
    const bindGroup: GPUBindGroup = device.createBindGroup({
      label: "u-group",
      layout: bindGroupLayout,
      entries: [{
        binding: 0,
        resource: {buffer: uniformBuffer}
      }]
    });
    device.popErrorScope().then(e => e && console.error('bindgroup error:', e.message));

    // TODO "CUBE PIPELINE"




  }

  [Symbol.dispose]() {
    // TODO: IMPLEMENT
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.#abortController.abort(); // Remove old listeners
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Event Listeners
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId);
      this.pointer_pos = [e.clientX, e.clientY];
      this.dragging = true;
    }, {signal: this.#abortController.signal});
    canvas.addEventListener("pointermove", (e) => {
      this.pointer_pos = [e.clientX, e.clientY];
    }, {signal: this.#abortController.signal});
    canvas.addEventListener("pointerup", () => {
      this.dragging = false;
      this.pointer_last = null;
    }, {signal: this.#abortController.signal});
    canvas.addEventListener("pointercancel", () => {
      this.dragging = false;
      this.pointer_last = null;
    }, {signal: this.#abortController.signal});

    this.#canvas = canvas;
    this.context = configureContext(this.#canvas, this.device!, this.format!);
  }

  tick(deltaTime: number) {
    tickData.deltaTime = deltaTime;
    tickData.drag_movement = [0.0, 0.0];

    if (this.dragging && this.pointer_pos)
    {
      if (this.pointer_last)
      {
        tickData.drag_movement = [
          this.pointer_pos[0]! - this.pointer_last[0]!,
          this.pointer_pos[1]! - this.pointer_last[1]!];
      }
      this.pointer_last = this.pointer_pos;
    }

    window.dispatchEvent(renderTickEvent);
  }

  registerMaterial(material: Material) {
    if (!this.device)
      throw new Error("registerMaterial: device was invalid.");

    if (!this.materials.has(material)) {
      this.device.pushErrorScope("validation");
      const buffer = this.device.createBuffer(material.getDescriptor());
      this.device.popErrorScope().then(e => e && console.error('Failed to create buffer for material:', e.message));
      // this.matBuffers.set(material.id, buffer);

      this.device.pushErrorScope("validation");
      const groupLayout = material.getLayout();
      const bindGroupLayout = this.device.createBindGroupLayout(groupLayout);
      const bindGroup = this.device.createBindGroup({
        label: `${material.id}-uniform`,
        layout: bindGroupLayout,
        entries: [{
          binding: 0,
          resource: {buffer: buffer}
        }]
      });
      this.device.popErrorScope().then(e => e && console.error('uniform buffer error:', e.message));
      // this.matBindings.set(material.id, bindGroup);

      this.materials.set(material, [
        material.id,
        "",
        buffer,
        bindGroup
      ]);
    }
  }

  recheckShaders() {
    //for(const mat of this.matBuffers.values()) { }
  }

  depthTexture: GPUTexture | null = null;
  async renderFrame() {
    if (!this.device || !this.context)
      throw new Error("Attempted to render frame without initializing render.")

    this.tick(getDeltaTime());

    const canvasTexture = this.context.getCurrentTexture();
    if (this.depthTexture && (this.depthTexture.width !== canvasTexture.width || this.depthTexture.height !== canvasTexture.height)) {
      this.depthTexture.destroy();
      this.depthTexture = null;
    }
    if (!this.depthTexture) {
      this.device.pushErrorScope('validation');
      this.depthTexture = this.device.createTexture({
        size: [canvasTexture.width, canvasTexture.height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      });
      this.device.popErrorScope().then(e => e && console.error('depth texture error:', e.message));
    }

    const commandEncoder = this.device.createCommandEncoder({label: 'frame-encoder',});
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: canvasTexture.createView(),
        clearValue: { r: 0.05, g: 0.05, b: 0.05, a: 1.0 },
        loadOp: "clear",
        storeOp: "store"
      }],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    })

    this.device.queue.writeBuffer(uniformBuffer, 0, mvp);


    // this.device.queue.writeBuffer(uniformBuffer, 0, transpose(mvp));
    // passEncoder.setPipeline(pipeline);
    // passEncoder.setVertexBuffer(0, vertexBuffer);
    // passEncoder.setBindGroup(0, bindGroup);
    // passEncoder.draw(36); // 6 faces x 2 triangles x 3 vertices
    // passEncoder.setPipeline(axisPipeline);
    // passEncoder.setVertexBuffer(0, axisBuffer);
    // passEncoder.setBindGroup(0, bindGroup);
    // passEncoder.draw(6);

    passEncoder.end();
    this.device.pushErrorScope('validation');
    this.device.queue.submit([commandEncoder.finish()])
    this.device.popErrorScope().then(e => e && console.error('Error on queue submission: ', e.message));
  }
}
