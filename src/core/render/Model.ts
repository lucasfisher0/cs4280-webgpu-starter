
import {Material, DEFAULT_MATERIAL} from "@/core/render/Material";
import {Entity} from "@/core/scenegraph/Entity";

const UNIFORM_SIZE: number = 16 * 4; // one mat4x4<f32>: mvp
const uniformGroupLayout: GPUBindGroupLayoutDescriptor = {
  label: "uniformLayout",
  entries: [{
    binding: 0,
    visibility: GPUShaderStage.VERTEX,
    buffer: {type: "uniform"}
  }]
};

export class Model extends Entity {
  vertices: Float32Array;
  material: Material;

  constructor(vertices: Float32Array,
              material?: Material | null,
              ...args: ConstructorParameters<typeof Entity>) {
    super(...args);
    this.vertices = vertices;
    this.material = material ?? DEFAULT_MATERIAL; // Set on constructor, not initialized to allow for DEFAULT_MATERIAL to be setup
  }

  setVertices(vertices: Float32Array) {
    this.vertices = vertices;
  }

  setMaterial(material: Material) {
    this.material = material;
  }
}
