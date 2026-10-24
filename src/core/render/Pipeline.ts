import type {Shader} from "@/core/shaders/Shader.ts";


export class PipelineBuilder {
  device: GPUDevice;
  format: GPUTextureFormat;
  shader: Shader;

  constructor(device: GPUDevice, format: GPUTextureFormat, shader: Shader) {
    this.device = device;
    this.format = format;
    this.shader = shader;
  }

  createDescriptor(): GPURenderPipelineDescriptor {
    return {
      label: "cube-pipeline",
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.shader.bindGroupLayout]
      }),
      vertex: {
        module: this.shader.shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 6 * 4, // Float32 per vertex * bytes per float32
            attributes: [
              {shaderLocation: 0, offset: 0, format: "float32x3"},
              {shaderLocation: 1, offset: 3 * 4, format: "float32x3"}
            ]
          }
        ]
      },
      fragment: {
        module: this.shader.shaderModule,
        entryPoint: "fragmentMain",
        targets: [{format: this.format}]
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus'
      }
    };
  }
}
