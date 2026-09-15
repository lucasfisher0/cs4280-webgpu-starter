// Hello Triangle — adapter → device → context → render pipeline → your
// first WGSL shaders. Every object created below traces back to one of
// the seven steps: request device → configure canvas → vertex buffer →
// shader module → render pipeline → render pass → submit. Read alongside
// hello-canvas2d.js — same setup → resize → render-loop shape, this one
// with a WebGPU device/pipeline layer underneath it.

import {createBuffer} from "@/lib/webgpu/buffers.js";
import {configureContext, getPreferredCanvasFormat} from "@/lib/webgpu/context.js";
import {createShaderModule} from "@/lib/webgpu/shaders.js";
import shaderCode from "./shaders.wgsl?raw";

import {CUBE_VERTICES} from "./cube.js"

let CONTROL_ELEMENTS = {};
let AUTOSPIN = true;

function initializeControls() {
  const CONTROLS = ["distance", "scale", "shearX", "shearY", "shearZ"];
  for (const control of CONTROLS) {
    const elem = document.getElementById(control);
    const label = document.getElementById(control + "Value");
    CONTROL_ELEMENTS[control] = {
      input: elem,
      label: label,
      value: elem.value
    };

    elem.addEventListener("input", (event) => onControlInput(control, event.target.value));
  }

  // Spin Toggler
  {
    const elem = document.getElementById("spinBtn");
    elem.addEventListener("click", () => {
      AUTOSPIN = !AUTOSPIN;
      elem.innerText = `Auto-spin: ${AUTOSPIN ? "On" : "Off"}`;
    });
  }

  // Canvas Dragging
  try {
    const elems = document.getElementsByClassName("drag-surface");
    for (const elem of elems) {
      elem.addEventListener("mousedown", (event) => dragMouse(true, event));
      elem.addEventListener("mouseup", (event) => dragMouse(false, event));
      elem.addEventListener("mousemove", (event) => dragMouseMove(event));
    }
  } catch (e) {
    console.error("Failed to retrieve drag-surface for camera controls!");
  }
}

let mouse_prev;
let is_dragging = false;
let mouse_delta = {x: 0, y: 0};
function dragMouse(isDown, event) {
  is_dragging = isDown;
  mouse_prev = is_dragging ? {x: event.offsetX, y: event.offsetY} : null;
  if (!isDown) {
    mouse_delta = {x: 0, y: 0};
  }
}

function dragMouseMove(event) {
  if (!is_dragging)
    return;

  mouse_delta = {x: event.offsetX - mouse_prev.x, y: event.offsetY - mouse_prev.y};
  mouse_prev = {x: event.offsetX, y: event.offsetY};
  console.log(mouse_delta);
}



/**
 * Runs constantly when a control slider is held. Used for label updates and value validations.
 * Runs before `onControlChanged`, allowing for easier access of value modification.
 * @param name
 * @param newValue
 */
function onControlInput(name, newValue) {
  let control = CONTROL_ELEMENTS[name];
  newValue = Number(newValue);
  control.value = newValue;

  let valueText;
  switch (name) {
    case "distance":
      valueText = newValue.toFixed(1);
      break;
    case "scale":
      valueText = newValue.toFixed(2) + "x";
      break;
    default:
      valueText = newValue.toFixed(2);
  }

  control.label.innerText = valueText;
  return newValue;
}

const CUBE_DATA = new Float32Array([]);



// Interleaved [x, y, r, g, b] per vertex, positions already in clip space.
// prettier-ignore
const VERTEX_DATA = new Float32Array([
  0.0, 0.6, 1.0, 0.35, 0.35, -0.6, -0.6, 0.35, 1.0, 0.35, 0.6, -0.6, 0.35, 0.35, 1.0,
]);
const FLOATS_PER_VERTEX = 5;

// Interleaved [x, y, z, r, g, b] for the axis guidelines
const AXIS_DATA = new Float32Array([
  1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1
]);




const statusEl = document.getElementById("statusWebgpu");
function showStatus(message) {
  statusEl.hidden = false;
  statusEl.textContent = message;
}

async function main() {

  initializeControls();
  if (!navigator.gpu) {
    showStatus("WebGPU is not supported in this browser. Try Chrome or Edge 113+.");
    return;
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    showStatus("No WebGPU adapter was found.");
    return;
  }

  const device = await adapter.requestDevice();
  const format = getPreferredCanvasFormat();
  const context = configureContext(canvas, device, format);

  const vertexBuffer = createBuffer(
    device,
    VERTEX_DATA,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    "cube-vertices",
  );
  const indexBuffer = createBuffer(
    device,
    VERTEX_DATA,
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    "cube-index"
  );
  const uniformBuffer = createBuffer(
    device,
    VERTEX_DATA,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, // mvp = projection * view * model
    "cube-index"
  );
  const shaderModule = createShaderModule(device, shaderCode, "cube");


  let bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: "uniform", // uniform | sotrage | read-only-storage
        },
      }
    ],
    label: "bindgroup-layout"
  });
  let pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
    label: "pipeline-layout"
  });

  // Compiled once, never inside the render loop — pipeline creation is
  // exactly when the browser compiles and validates the shaders.
  const pipeline = device.createRenderPipeline({
    label: "cube-pipeline",
    layout: "auto",
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
    primitive: {topology: "triangle-list"},
  });

  const axisPipeline = device.createRenderPipeline({
    label:"axis-pipeline",
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: 6 * 3,
          attributes: [
            {shaderLocation: 0, offset: 0, format: "float32x3"}, // position
            {shaderLocation: 1, offset: 3 * 4, format: "float32x3"}, // color
          ]
        }
      ]
    },
    fragment: {topology: "triangle-list"},
  });

  function frame() {
    const encoder = device.createCommandEncoder({label: "hello-triangle-encoder"});
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
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

window.addEventListener('load', () => {
  main(); // Ensure page has finished loading before run
});
