import {createShaderModule} from "@/lib/webgpu/shaders";
import {type Shader} from "@/core/shaders/Shader.ts"
import shaderCode from './BlinnPhong.wgsl?raw'

export class BlinnPhong implements Shader {
  SHADER_NAME: string = "BlinnPhong";
  UNIFORM_SIZE: number = 80 * 4;
  SHADER_CODE: string = shaderCode;

  uniformBuffer: GPUBuffer;
  bindGroupLayout: GPUBindGroupLayout;
  bindGroup: GPUBindGroup;
  shaderModule: GPUShaderModule;

  constructor(device: GPUDevice) {
    this.uniformBuffer = this.createUniformBuffer(device);
    this.bindGroupLayout = this.createBindGroupLayout(device);
    this.bindGroup = this.createBindGroup(device);
    this.shaderModule = createShaderModule(device, this.SHADER_CODE, `${this.SHADER_NAME}-shader`);
  }

  createUniformBuffer(device: GPUDevice) {
    device.pushErrorScope('validation');
    const buffer = device.createBuffer({
      label: `${this.SHADER_NAME}-uniform`,
      size: this.UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.popErrorScope().then(e => e && console.error(`Error creating uniform buffer for shader '${this.SHADER_NAME}':`, e.message));
    return buffer;
  }

  createBindGroupLayout(device: GPUDevice) {
    return device.createBindGroupLayout({
      label: `${this.SHADER_NAME}-uniform-layout`,
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
      label: `${this.SHADER_NAME}-uniform-group`,
      layout: this.bindGroupLayout,
      entries: [{
        binding: 0,
        resource: {buffer: this.uniformBuffer}
      }]
    });
    device.popErrorScope().then(e => e && console.error('Shader|BindGroup Error:', e.message));
    return bindGroup;
  }
}
