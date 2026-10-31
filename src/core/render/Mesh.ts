import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts";
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

  draw(pass: GPURenderPassEncoder, slot: number = 0) {
    throw new Error("Mesh-derived class does not implement draw function.");
  }
}
