// Hello Triangle — the minimal WebGPU vertex/fragment pair.
//
// Vertex buffer layout (see hello-triangle.js): interleaved [x, y, r, g, b]
// per vertex, positions already in clip space (both axes in [-1, 1]).

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
};

@vertex
fn vertexMain(
  @location(0) position: vec2<f32>,
  @location(1) color: vec3<f32>,
) -> VertexOutput {
  var out: VertexOutput;
  out.position = vec4<f32>(position, 0.0, 1.0);
  out.color = color;
  return out;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
