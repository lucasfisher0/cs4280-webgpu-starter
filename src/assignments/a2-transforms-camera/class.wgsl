
struct VertexInput {
    @location(0) position: vec2<f32>,
    @location(1) color: vec3<f32>
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>
};

@vertex
fn vertexMain(in: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4<f32>(in.position, 0.0, 1.0);
    output.color = in.color;

    return output;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
