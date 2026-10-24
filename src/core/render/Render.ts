import {configureContext, getPreferredCanvasFormat} from "@/lib/webgpu/context";


import {Material, DEFAULT_MATERIAL} from "@/core/render/Material";
// import {Model} from "@/core/render/Model";
import {createShaderModule} from "@/lib/webgpu/shaders";
import {SceneNode} from "@/core/scenegraph/SceneNode.ts";
import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import {BlinnPhong} from "@/core/shaders/BlinnPhong.ts";
import {PipelineBuilder} from "@/core/render/Pipeline.ts";
import type {Shader} from "@/core/shaders/Shader.ts";
import type {Camera} from "@/core/render/Camera.ts";
import {OrbitCamera} from "@/core/render/OrbitCamera.ts";
import {ModelNode} from "@/core/scenegraph/ModelNode.ts";

type MaterialGroup = [id: string, shader: string, buffer: GPUBuffer, bindGroup: GPUBindGroup];

let currTime: number | null = null;
function getDeltaTime(): number {
  const oldTime = currTime;
  currTime = performance.now();
  return !oldTime ? 0.0 : (currTime - oldTime) * 0.001;
};

const tickData: TickData = {deltaTime: 0.0, drag_movement: [0.0, 0.0]};
export const renderTickEvent = new CustomEvent<TickData>("tick", {
  detail: tickData,
  bubbles: true
});

const CAMERA_DEFAULT_POSITION: Mat4 = Transform.translate(3, 3, -3);

export class Renderer implements Disposable {
  // WebGPU
  device: GPUDevice;
  format: GPUTextureFormat;
  context: GPUCanvasContext;
  shader: Shader;
  pipeline: GPURenderPipeline;

  // Canvas
  #canvas: HTMLCanvasElement;
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
  camera: Camera;

  constructor(device: GPUDevice, canvas: HTMLCanvasElement, camera?: Camera) {
    this.device = device;
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.#canvas = canvas;
    this.context = configureContext(this.#canvas, this.device!, this.format!);
    this.setCanvas(canvas);

    // Camera
    this.camera = camera ?? new OrbitCamera({
      name: "Camera",
      translation: CAMERA_DEFAULT_POSITION
    });
    this.scene.addChild(this.camera);

    // Shader & Pipeline
    this.shader = new BlinnPhong(this.device);
    this.pipeline = this.createPipeline(this.shader);
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

  createPipeline(shader: Shader): GPURenderPipeline {
    let builder = new PipelineBuilder(this.device!, this.format!, shader);
    this.device!.pushErrorScope('validation');
    const pipeline = this.device!.createRenderPipeline(builder.createDescriptor());
    this.device!.popErrorScope().then(e => e && console.error('Pipeline creation error:', e.message));
    return pipeline;
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

  depthTexture: GPUTexture | null = null;
  renderFrame() {
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

    const viewMatrix = this.camera.getViewMatrix();
    this.device.queue.writeBuffer(this.shader.uniformBuffer, 64, new Float32Array(viewMatrix.toArray()));

    const a = this.#canvas.clientWidth / this.#canvas.clientHeight;
    const projectionMatrix = Transform.perspective(this.camera.verticalFov, a, this.camera.clipNear, this.camera.clipFar);
    this.device.queue.writeBuffer(this.shader.uniformBuffer, 128, new Float32Array(projectionMatrix.toArray()));


    // TODO: REMOVE
    const params = {
      cameraDistance: 5,
      cameraSpin: true,
      depth: 1,
      modelScale: 1,
      diffuse: {r: 1, g: 0, b: 1},
      lightPosition: {x: 0, y: 0, z: 0},
      lightStrength: 0.8,
      ambientStrength: 0.2,
      specularCoefficient: 0.8,
      exponent: 1000,
    };

    const camPosition = this.camera.getWorldTransform().getPosition();
    this.device.queue.writeBuffer(this.shader.uniformBuffer, 256, new Float32Array([...camPosition.toArray(), params.ambientStrength]));
    this.device.queue.writeBuffer(this.shader.uniformBuffer, 272, new Float32Array(
      [params.lightPosition.x, params.lightPosition.y, params.lightPosition.z, params.lightStrength]
    ));
    this.device.queue.writeBuffer(this.shader.uniformBuffer, 288, new Float32Array(
      [params.diffuse.r, params.diffuse.g, params.diffuse.b, params.exponent, params.specularCoefficient]
    ));

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.shader.bindGroup);

    const slot = 0;
    const drawNode = (_node: SceneNode) => {
      _node.children.forEach((child: SceneNode) => {drawNode(child)});
      if (_node instanceof ModelNode)
      {
        const modelMatrix = _node.getTransformMatrix();
        this.device.queue.writeBuffer(this.shader.uniformBuffer, 0, new Float32Array(modelMatrix.toArray()));

        const normalMatrix = modelMatrix.invert();
        this.device.queue.writeBuffer(this.shader.uniformBuffer, 0, new Float32Array(normalMatrix.toArray()));

        const mesh = _node.mesh;
        mesh.draw(passEncoder, slot);
      }
    }

    drawNode(this.scene);
    passEncoder.end();
    this.device.pushErrorScope('validation');
    this.device.queue.submit([commandEncoder.finish()])
    this.device.popErrorScope().then(e => e && console.error('Error on queue submission: ', e.message));
  }
}
