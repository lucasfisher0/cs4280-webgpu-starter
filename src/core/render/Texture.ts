




export class Texture {

  texture: GPUTexture | null = null;
  layout: GPUBindGroupLayout | null = null;
  bindGroups: GPUBindGroup[] | null = null;

  async loadTexture(device: GPUDevice, /*buffer: GPUBuffer,*/ file: string) {
    const response = await fetch(file);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const texture = device.createTexture({
      dimension: "2d",
      format: "rgba8unorm",
      mipLevelCount: Math.floor(Math.log2(Math.max(bitmap.width, bitmap.height))) + 1,
      // sampleCount?: GPUSize32,
      size: [bitmap.width, bitmap.height],
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      // viewFormats?: GPUTextureFormat[],
    });

    // Mipmap Generation
    let src = bitmap;
    for (let level = 1; level < texture.mipLevelCount; level++) {
      const w = Math.max(1, src.width >> 1);
      const h = Math.max(1, src.height >> 1);
      const mip = new OffscreenCanvas(w, h);
      mip.getContext("2d")!.drawImage(src, 0, 0, w, h);
      device.queue.copyExternalImageToTexture({source: mip}, {texture: texture, mipLevel: level}, [w, h]);
      src = mip.transferToImageBitmap();
    }

    this.texture = texture;
    //this.createBindGroups(device, buffer);
  }

  createBindGroups(device: GPUDevice, buffer: GPUBuffer) {
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
    this.bindGroups = samplers.map(sampler => device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: buffer } },
        { binding: 1, resource: sampler },
        { binding: 2, resource: this.texture!.createView() }]
    }));
  }
}
