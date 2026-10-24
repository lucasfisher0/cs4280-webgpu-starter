import {createShaderModule} from "@/lib/webgpu/shaders";

interface Shader {
  SHADER_NAME: string;
  UNIFORM_SIZE: number;
  SHADER_CODE: string;

  uniformBuffer: GPUBuffer;
  bindGroupLayout: GPUBindGroupLayout;
  bindGroup: GPUBindGroup;
  shaderModule: GPUShaderModule;

  createUniformBuffer(device: GPUDevice): GPUBuffer;
  createBindGroupLayout(device: GPUDevice): GPUBindGroupLayout;
  createBindGroup(device: GPUDevice): GPUBindGroup;
}
export type {Shader};




/*
export class Shader {
  #SHADER_NAME: string = "";
  #UNIFORM_SIZE: number = 0;
  #SHADER_CODE = "";

  uniformBuffer: GPUBuffer;
  bindGroupLayout: GPUBindGroupLayout;
  bindGroup: GPUBindGroup;
  shaderModule: GPUShaderModule;

  constructor(device: GPUDevice) {
    this.uniformBuffer = this.createUniformBuffer(device);
    this.bindGroupLayout = this.createBindGroupLayout(device);
    this.bindGroup = this.createBindGroup(device);
    this.shaderModule = createShaderModule(device, this.#SHADER_CODE, `${this.#SHADER_NAME}-shader`);
  }

  createUniformBuffer(device: GPUDevice) {
    device.pushErrorScope('validation');
    const buffer = device.createBuffer({
      label: `${this.#SHADER_NAME}-uniform`,
      size: this.#UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.popErrorScope().then(e => e && console.error(`Error creating uniform buffer for shader '${this.#SHADER_NAME}':`, e.message));
    return buffer;
  }

  createBindGroupLayout(device: GPUDevice) {
    return device.createBindGroupLayout({
      label: `${this.#SHADER_NAME}-uniform-layout`,
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {type: "uniform"}
      }]
    });
  }

  createBindGroup(device: GPUDevice) {
    device.pushErrorScope('validation');
    const bindGroup = device.createBindGroup({
      label: `${this.#SHADER_NAME}-uniform-group`,
      layout: this.bindGroupLayout,
      entries: [{
        binding: 0,
        resource: {buffer: this.uniformBuffer}
      }]
    });
    device.popErrorScope().then(e => e && console.error('bindgroup error:', e.message));
    return bindGroup;
  }
}
*/
