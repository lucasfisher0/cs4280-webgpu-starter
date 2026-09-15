import {lookAt} from "@/lib/math/transforms.js";
import {AXIS_VERTICES, CUBE_VERTICES} from "@/assignments/a2-transforms-camera/cube.js";
import {configureContext, getPreferredCanvasFormat} from "@/lib/webgpu/context.js";
import {createBuffer} from "@/lib/webgpu/buffers.js";
import shaderCode from "./shaders.wgsl?raw";
import {createShaderModule} from "@/lib/webgpu/shaders.js";
import {identity, multiplyAll} from "@/lib/math/mat4.js";

/**
 * Model class responsible for physical transforms.
 */
class Model {
  #vertices;

  constructor(_vertices, _position, _rotation, _scale) {
    this.#vertices = _vertices ?? throw new Error("Attempted to instantiate a model without valid vertices!");
    this.position = _position ?? identity();
    this.rotation = _rotation ?? identity();
    this.scale = _scale ?? identity();
  }

  setVertices(_vertices) {
    this.#vertices = _vertices ?? throw new Error("Attempted to set model vertices with invalid input!");
  }

  getVertices() {
    return multiplyAll(this.scale, this.rotation, this.position);
  }
}

/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
class Scene {
  #canvas;
  models = [];
  cubePipeline;
  axisPipeline;

  constructor(canvas, tetherDistance) {
    this.#canvas = canvas;

    // HARDCODED
    this.models[0] = new Model(CUBE_VERTICES);
    this.models[1] = new Model(AXIS_VERTICES);
  }

  async InitializeBuffers(_adapter) {
    const device = await _adapter.requestDevice();
    const format = getPreferredCanvasFormat();
    const context = configureContext(canvas, device, format);

    const vertexBuffer = createBuffer(
      device,
      this.models[0].getVertices(), // 3 pos + 3 normal
      GPUBufferUsage.VERTEX,
      "cube-vertices"
    );

    const vertexAxisBuffer = createBuffer(
      device,
      this.models[1].getVertices(), // 3 pos + 3 color
      GPUBufferUsage.VERTEX,
      "axis-vertices"
    );

    const indexBuffer = createBuffer(
      device,
      null,
      GPUBufferUsage.INDEX,
      "index"
    )

    this.uniformBuffer = createBuffer(
      device,
      null,
      GPUBufferUsage.UNIFORM,
      "uniform"
    );

    const shaderModule = createShaderModule(device, shaderCode, "cube");


    /*
    this.cubePipeline = device.createRenderPipeline({
      label: "cube-pipeline",
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: FLOATS_PER_VERTEX * 4,
            attributes: [
              {shaderLocation: 0, offset: 0, format: "float32x3"}, // position
              {shaderLocation: 1, offset: 3 * 4, format: "float32x3"}, // color
            ],
          },
        ],
      },
      fragment: {module: shaderModule, entryPoint: "fragmentMain", targets: [{format}]},
      primitive: {topology: "triangle-list"},
    });
    */


    this.axisPipeline = device.createRenderPipeline({
      label: "cube-pipeline",
      layout: "auto",
      topology: "line-list",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: FLOATS_PER_VERTEX * 4,
            attributes: [
              {shaderLocation: 0, offset: 0, format: "float32x2"}, // position
              {shaderLocation: 1, offset: 2 * 4, format: "float32x3"}, // color
            ],
          },
        ],
      },
      fragment: {module: shaderModule, entryPoint: "fragmentMain", targets: [{format}]},
      primitive:








  }

  function draw(device) {
    const encoder = device.createCommandEncoder({label: "encoder"});
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: {r: 0.06, g: 0.06, b: 0.09, a: 1},
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    encoder.writeBuffer(this.uniformBuffer, bufferOffset, data, dataOffset);
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, this.models[0].getVertices());
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
  }
}
