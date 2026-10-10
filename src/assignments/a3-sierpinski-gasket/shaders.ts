/* generated via tgpu-gen by TypeGPU */
import { tgpu, d } from 'typegpu';

/* structs */
export const Uniforms = d.struct({
  MVP: d.mat4x4f
});

export const VertexOutput = d.struct({
  position: d.vec4f,
  color: d.location(0, d.vec3f),
});

/* bindGroupLayouts */
export const layout0 = tgpu.bindGroupLayout({
  uniforms: {
    uniform: Uniforms,
  },
});
