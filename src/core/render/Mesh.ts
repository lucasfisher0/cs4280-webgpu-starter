import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts";
import {EDrawLayer, type IDrawable} from "@/core/render/IDrawable.ts";
import type {BoundingBox} from "@/core/collision/Shapes";

export class Mesh implements Disposable, IDrawable {
  #isDisposed = false;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer | undefined;

  constructor(vertexBuffer: GPUBuffer, indexBuffer?: GPUBuffer) {
    // Passing the buffers from the subclass constructor forces the derived classes to
    // implement this in their constructor.
    this.vertexBuffer = vertexBuffer;
    this.indexBuffer = indexBuffer;
  }

  // Disposable
  isValid(): boolean {
    return !(this.#isDisposed || !this.vertexBuffer || !this.indexBuffer);
  }

  dispose(): void {
    if (this.#isDisposed)
      return;

    this.vertexBuffer?.destroy()
    this.indexBuffer?.destroy()
    this.#isDisposed = true;
  }

  // Allows for using syntax.
  [Symbol.dispose]() {
    this.dispose();
  }
  // End Disposable

  // IDrawable
  visible: boolean = true;
  isVisible(): boolean { return this.visible; }
  getBounds(): BoundingBox | undefined {
    return undefined;
  }
  drawLayer: EDrawLayer = EDrawLayer.WORLD;
  getLayer(): EDrawLayer { return this.drawLayer; }
  draw(queue: GPUQueue, pass: GPURenderPassEncoder, slot: number = 0) {
    // Queue Commands - device.queue
    // copyExternalImageToTexture(source: GPUCopyExternalImageSourceInfo, destination: GPUCopyExternalImageDestInfo, copySize: GPUExtent3D): void;
    // writeBuffer(buffer: GPUBuffer, bufferOffset: GPUSize64, data: AllowSharedBufferSource, dataOffset?: GPUSize64, size?: GPUSize64): void;
    // writeTexture(destination: GPUTexelCopyTextureInfo, data: AllowSharedBufferSource, dataLayout: GPUTexelCopyBufferLayout, size: GPUExtent3D): void;

    // Render Pass Commands
    // draw(vertexCount: GPUSize32, instanceCount?: GPUSize32, firstVertex?: GPUSize32, firstInstance?: GPUSize32): void;
    // drawIndexed(indexCount: GPUSize32, instanceCount?: GPUSize32, firstIndex?: GPUSize32, baseVertex?: GPUSignedOffset32, firstInstance?: GPUSize32): void;
    // drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;
    // drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;
    // setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, offset?: GPUSize64, size?: GPUSize64): void;
    // setPipeline(pipeline: GPURenderPipeline): void;
    // setVertexBuffer(slot: GPUIndex32, buffer: GPUBuffer | null, offset?: GPUSize64, size?: GPUSize64): void;
    throw new Error("Mesh-derived class does not implement draw function.");
  }
  // End IDrawable
}

