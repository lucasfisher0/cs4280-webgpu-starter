struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) uv: vec2f
};
@group(0) @binding(0) var smp: sampler;
@group(0) @binding(1) var img: texture_2d<f32>;

@vertex
fn vs(@builtin(vertex_index) i: u32) -> VertexOutput {
    var out: VertexOutput;
    let c = vec2f(f32((i << 1u) & 2u), f32(i & 2u));     // (0,0), (2,0), (0,2)
    out.pos = vec4f(c * 2.0 - 1.0, 0.0, 1.0);
    out.uv = vec2f(c.x, 1.0 - c.y);
    return out;
}

@fragment
fn fs(o: VertexOutput) -> @location(0) vec4f {
    return textureSample(img, smp, o.uv);
}
