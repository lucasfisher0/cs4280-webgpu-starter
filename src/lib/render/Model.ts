
import {Material, DEFAULT_MATERIAL} from "@/lib/render/Material";





const UNIFORM_SIZE: number = 16 * 4; // one mat4x4<f32>: mvp
const uniformGroupLayout: GPUBindGroupLayoutDescriptor = {
  label: "uniformLayout",
  entries: [{
    binding: 0,
    visibility: GPUShaderStage.VERTEX,
    buffer: {type: "uniform"}
  }]
};




export class Model {
  vertices: Float32Array;
  material: Material = DEFAULT_MATERIAL;

  constructor(vertices: Float32Array, material: Material | null) {
    this.vertices = vertices;
    if (material)
      this.material = material;
  }

  setVertices(vertices: Float32Array) {
    this.vertices = vertices;
  }
}
