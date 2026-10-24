import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import {createBuffer} from "@/lib/webgpu/buffers";

export class Mesh implements Disposable {
  #isDisposed = false;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;

  constructor(vertexBuffer: GPUBuffer, indexBuffer: GPUBuffer) {
    // Passing the buffers from the subclass constructor forces the derived classes to
    // implement this in their constructor.
    this.vertexBuffer = vertexBuffer;
    this.indexBuffer = indexBuffer;
  }

  isValid(): boolean {
    return !(this.#isDisposed || !this.vertexBuffer || !this.vertexBuffer || !this.indexBuffer);
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

  draw(pass: GPURenderPassEncoder, slot: number = 0) {
    throw new Error("Mesh-derived class does not implement draw function.");
  }
}
