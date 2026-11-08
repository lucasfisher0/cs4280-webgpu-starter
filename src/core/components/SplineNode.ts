import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"

import {SceneNode, type SceneNodeDescriptor} from "@/core/scenegraph/SceneNode";
import {InputManager} from "@/core/InputManager.ts";
import shaderCode from "@/core/shaders/spline.wgsl?raw";
import {Camera} from "@/core/components/Camera.ts";

interface SplineNodeDescriptor extends SceneNodeDescriptor {
  points?: Vec3[];
  closed?: boolean;
  samples?: number; // Samples per segment
  tension?: number;
  showPolygon?: boolean;
}
export type {SplineNodeDescriptor};

const MAX_POINTS = 64;
const MAX_SEGMENTS = 64;

const BEZIER_B = [[1, 0, 0, 0], [-3, 3, 0, 0], [3, -6, 3, 0], [-1, 3, -3, 1]];

const cardinalB = (tension: number) => {
  const s = (1 - tension) / 2;
  return [[0, 1, 0, 0], [-s, 0, s, 0], [2 * s, s - 3, 3 - 2 * s, -s], [-s, 2 - s, s - 2, s]];
};


// --- Gather rules: the user's points P -> a list of 4-value segments ---
// P is an array of [x, y] points. Each gather function returns an array
// of segments, and each segment is an array of four [x, y] control
// values, in the order the basis matrix expects them. The rule text in
// SPLINES below (also shown in the info panel) says what each one gathers.
const wrap = (i: number, n: number): number => ((i % n) + n) % n;                 // closed: indices wrap around
const clamp = (i: number, n: number): number => Math.min(n - 1, Math.max(0, i));  // open: repeat the end points

// Bézier. Segment i uses P[3i] ... P[3i+3]; neighbors share an end
// point (slide "Joining Bézier Segments"). Make as many whole segments as P allows.
function gatherBezier(P: Vec3[], _closed: boolean) {
  const segments: Vec3[][] = []; // Each segment is an array of 4 points
  for (let i = 0; 3 * i + 3 < P.length; i++)
    segments.push([P[3 * i]!, P[3 * i + 1]!, P[3 * i + 2]!, P[3 * i + 3]!]);
  return segments;
}


const DEFAULT_POINTS: Vec3[] = [
  new Vec3(-1.25, 0.0, -0.5  ),
  new Vec3(-0.9,  0.0,  0.45 ),
  new Vec3(-0.4,  0.0,  0.6  ),
  new Vec3(0.0,   0.0, -0.1  ),
  new Vec3(0.45,  0.0, -0.6  ),
  new Vec3(0.9,   0.0, -0.2  ),
  new Vec3(1.2,   0.0,  0.55 )
];

/**
 * Node that controls a 3D spline. Currently hardcoded for cubic Bezier segments using a Catmull-Rom spline.
 */
export class SplineNode extends SceneNode {
  #device: GPUDevice;

  points: Vec3[];
  closed: boolean;
  samples: number;
  tension: number;
  showPolygon: boolean;

  private uniformBuffer: GPUBuffer;
  private uniformData: ArrayBuffer;
  private f32: Float32Array;
  private u32: Uint32Array;
  private controlData: Float32Array;
  private controlBuffer: GPUBuffer;
  private pointData: Float32Array;
  private pointBuffer: GPUBuffer;

  /* All splines share the same shaders, layouts, and pipelines. The only Node-specific resources are the bind groups
  * themselves. */
  bindGroup: GPUBindGroup;
  static initialized: boolean = false;
  static bindGroupLayout: GPUBindGroupLayout;
  static curvePipeline: GPURenderPipeline;
  static stripPipeline: GPURenderPipeline;
  static pairsPipeline: GPURenderPipeline;
  static pointPipeline: GPURenderPipeline;

  constructor(device: GPUDevice, format: GPUTextureFormat, desc: SplineNodeDescriptor) {
    super(desc);
    this.#device = device;

    this.points = desc.points ?? DEFAULT_POINTS;
    this.closed = desc.closed ?? false;
    this.samples = desc.samples ?? 32;
    this.tension = desc.tension ?? 0;
    this.showPolygon = desc.showPolygon ?? true;

    const UNIFORM_SIZE = 144;
    this.uniformData = new ArrayBuffer(UNIFORM_SIZE);
    this.f32 = new Float32Array(this.uniformData);
    this.u32 = new Uint32Array(this.uniformData);
    this.uniformBuffer = device.createBuffer({ size: UNIFORM_SIZE, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.controlData = new Float32Array(MAX_SEGMENTS * 4 * 4); // vec3<f32> uses 16 byte alignment
    this.controlBuffer = device.createBuffer({ size: this.controlData.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    this.pointData = new Float32Array(MAX_POINTS * 4); // vec3<f32> uses 16 byte alignment
    this.pointBuffer = device.createBuffer({ size: this.pointData.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });

    // Static initialization for shaders, layouts, and pipelines.
    if (!SplineNode.initialized) {
      SplineNode.bindGroupLayout = device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
          { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
          { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }
        ]
      });

      // One shader module, one pipeline per (vertex entry point, topology).
      // None has a vertex buffer: everything comes from the storage buffers.
      const shaderModule = device.createShaderModule({ code: shaderCode });
      const layout = device.createPipelineLayout({ bindGroupLayouts: [SplineNode.bindGroupLayout] });
      const makePipeline = (entryPoint: string, topology: GPUPrimitiveTopology) => device.createRenderPipeline({
        layout,
        vertex: { module: shaderModule, entryPoint },
        fragment: { module: shaderModule, entryPoint: 'fs_main', targets: [{ format }] },
        primitive: { topology },
        // animate() always attaches a depth buffer, so the pipeline must declare one.
        depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'always' }
      });

      SplineNode.curvePipeline = makePipeline('vs_curve', 'line-strip');
      SplineNode.stripPipeline = makePipeline('vs_polygon', 'line-strip');
      SplineNode.pairsPipeline = makePipeline('vs_polygon', 'line-list');
      SplineNode.pointPipeline = makePipeline('vs_point', 'triangle-strip');
    }

    this.bindGroup = device.createBindGroup({
      layout: SplineNode.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.controlBuffer } },
        { binding: 2, resource: { buffer: this.pointBuffer } }
      ]
    });
  }

  draw(pass: GPURenderPassEncoder) {
    const B = BEZIER_B;
    const P = this.points;

    // 1. Gather (CPU). Only this step and B depend on the spline type.
    const segments = gatherBezier(P, this.closed).slice(0, MAX_SEGMENTS);
    segments.forEach((seg, i) => {
      const pad = seg.map(x => new Vec4(x.x, x.y, x.z, 0));
      this.controlData.set(Vec4.flatArray(pad), 16 * i);
    });
    this.#device.queue.writeBuffer(this.controlBuffer, 0, this.controlData);
    this.pointData.set(Vec4.flatArray(P.map(x => new Vec4(x.x, x.y, x.z, 0))));
    this.#device.queue.writeBuffer(this.pointBuffer, 0, this.pointData);

    // MVP
    const model = this.worldTransform;
    const view = Camera.activeCamera.getViewMatrix();
    const proj = Camera.activeCamera.getProjection();
    const mvp = Mat4.multiplyAll([proj, view, model]);

    this.f32.set(B.flat(), 0);                    // floats 0-15, row by row
    this.f32.set(mvp.toArray(), 16);              // floats 16-31, row by row
    this.u32[32] = this.samples;                        // byte 128, a u32
    this.u32[34] = Math.max(1, P.length);       // byte 136, a u32
    this.#device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData);

    pass.setBindGroup(0, this.bindGroup);
    if (this.showPolygon && P.length >= 2) {
      // if (spline.polygon === 'pairs') {
      //   pass.setPipeline(pairsPipeline);
      //   pass.draw(P.length - (P.length % 2));            // anchor-handle pairs
      // } else {
        pass.setPipeline(SplineNode.stripPipeline);
        // pass.draw(P.length + (this.closed && spline.closable ? 1 : 0));   // +1 returns to P[0]
        pass.draw(P.length + (this.closed ? 1 : 0));   // +1 returns to P[0]
      // }
    }
    // 2-3. Weigh and blend (GPU): samples + 1 vertices per segment, one instance per segment.
    pass.setPipeline(SplineNode.curvePipeline);
    pass.draw(this.samples + 1, segments.length);
    pass.setPipeline(SplineNode.pointPipeline);
    pass.draw(4, P.length);
  }
}
