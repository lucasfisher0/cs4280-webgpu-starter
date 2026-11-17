
struct Uniforms {
    mvp: mat4x4<f32>,       // (0) - MVP, column-major.
    diffuse: vec3<f32>,     // (16) - diffuse in RGB
};
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) color: vec3<f32>
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(1) color: vec3<f32>,
};

@vertex
fn vertexMain(in: VertexInput) -> VertexOutput  {
    var out: VertexOutput;
    out.position = uniforms.mvp * vec4<f32>(in.position, 1.0);
    out.color = in.color;
    return out;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(in.color, 1.0);
}
