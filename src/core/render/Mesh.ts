import {Vec2, Vec3, Vec4, Mat4, Transform} from "@/core/Math.ts"
import {createBuffer} from "@/lib/webgpu/buffers";

export class Mesh implements Disposable {
  #isDisposed = false;
  vertexBuffer: GPUBuffer | null = null;
  indexBuffer: GPUBuffer | null = null;

  constructor(vertexBuffer: GPUBuffer, indexBuffer: GPUBuffer) {
    // Passing the buffers from the subclass constructor forces the derived classes to
    // implement this in their constructor.
    this.vertexBuffer = vertexBuffer;
    this.indexBuffer = indexBuffer;
  }

  isValid(): boolean {
    return !(this.#isDisposed || !this.device || !this.vertexBuffer || !this.vertexBuffer || !this.indexBuffer);
  }

  dispose(): void {
    if (this.#isDisposed)
      return;

    this.vertexBuffer?.destroy()
    this.vertexBuffer = null;
    this.indexBuffer?.destroy()
    this.indexBuffer = null;

    this.#isDisposed = true;
  }

  // Allows for using syntax.
  [Symbol.dispose]() {
    this.dispose();
  }
}
