struct Uniforms {
  MVP: mat4x4<f32>
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
};

@vertex
fn vertexMain(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VertexOutput {
  var out: VertexOutput;
  out.position = uniforms.MVP * vec4<f32>(position, 1.0);
  out.color = normal * 0.5 + 0.5; // remap [-1,1] to [0,1]
  return out;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
