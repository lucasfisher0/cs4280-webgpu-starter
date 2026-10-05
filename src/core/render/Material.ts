
import * as Vec3 from "@/lib/math/vec3";
import * as Mat4 from "@/lib/math/mat4";

export type Shader = [name: string, code: string];

export class Material {
  readonly id: string = crypto.randomUUID();
  get hashKey(): string {
    return this.id;
  }

  MVP: Float32Array = Mat4.identity();                         // 4x4 = 16
  lightPosition: Float32Array = new Float32Array([0, 0, 0]);   // 3
  ambient: Float32Array = new Float32Array([0, 0, 0]);         // 3
  diffuse: Float32Array = new Float32Array([0, 0, 0]);         // 3
  specular: Float32Array = new Float32Array([0, 0, 0]);        // 3
  exponent: number = 1;                                        // 1
  SIZE_BYTES = 116; // 29 values, all 32-bit
  shader: Shader = ["", ""];

  // buffer: GPUBuffer | null = null;
  getDescriptor(): GPUBufferDescriptor {
    return {
      label: "uniform",
      size: this.SIZE_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    };
  }

  getLayout(): GPUBindGroupLayoutDescriptor {
    return {
      label: "",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {type: "uniform"},
        }
      ]
    }
  }
}

export const DEFAULT_MATERIAL = new Material();
