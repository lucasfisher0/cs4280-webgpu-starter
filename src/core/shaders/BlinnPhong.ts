import {createShaderModule} from "@/lib/webgpu/shaders";
// import {type Shader} from "@/core/shaders/Shader.ts";
import shaderCode from './BlinnPhong.wgsl?raw';

import wood from 'textures/wood.png?url';
import tile from 'textures/wood.png?url';
import metal from 'textures/wood.png?url';
import {size} from "typegpu/data";


/*
export class BlinnPhong {
  SHADER_NAME: string = "BlinnPhong";
  UNIFORM_SIZE: number = 80 * 4;
  SHADER_CODE: string = shaderCode;
  shaderModule: GPUShaderModule;

  uniformBuffer: GPUBuffer;
  uniformLayout: GPUBindGroupLayout;
  uniformGroup: GPUBindGroup;

  texture: GPUTexture;
  textureLayout: GPUBindGroupLayout;
  textureGroup: GPUBindGroup;

  sampler: GPUSampler;
  samplerLayout: GPUBindGroupLayout;
  samplerGroup: GPUBindGroup;


  constructor(device: GPUDevice) {
    this.shaderModule = createShaderModule(device, this.SHADER_CODE, `${this.SHADER_NAME}-shader`);
    this.uniformBuffer = this.createUniformBuffer(device);
    this.uniformLayout = this.createBindGroupLayout(device);
    this.uniformGroup = this.createBindGroup(device);



    const samplers: GPUSampler[] = ([
      { magFilter: 'nearest', minFilter: 'nearest', lodMaxClamp: 0 },
      { magFilter: 'linear', minFilter: 'linear', lodMaxClamp: 0 },
      { magFilter: 'linear', minFilter: 'linear', mipmapFilter: 'linear' },
      { magFilter: 'linear', minFilter: 'linear', mipmapFilter: 'linear', maxAnisotropy: 16 },
    ] as GPUSamplerDescriptor[]).map(desc => device.createSampler({ ...desc, addressModeU: 'repeat' }));

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' }
      },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} }]
    });
    const bindGroups = samplers.map(sampler => device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: sampler },
        { binding: 2, resource: this.texture.createView() }]
    }));





  }

  setTexture() {


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
      layout: this.uniformLayout,
      entries: [{
        binding: 0,
        resource: {buffer: this.uniformBuffer}
      }]
    });
    device.popErrorScope().then(e => e && console.error('Shader|BindGroup Error:', e.message));
    return bindGroup;
  }
}
*/
