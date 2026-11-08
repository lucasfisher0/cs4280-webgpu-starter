
struct Params {
    B: mat4x4f,          // the basis matrix, uploaded row by row (see vs_curve)
    mvpMatrix: mat4x4f,  // byte offset 64
    samples: u32,        // byte offset 128
    pointCount: u32,     // byte offset 136
};

@group(0) @binding(0) var<uniform> params : Params;
@group(0) @binding(1) var<storage, read> control : array<vec3f>;   // 4 control values per segment
@group(0) @binding(2) var<storage, read> points : array<vec3f>;    // the points the user drags

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>,
};

fn toClip(p : vec3f) -> vec4f {
    return params.mvpMatrix * vec4f(p, 1.0);
}

@vertex
fn vs_curve(@builtin(vertex_index) i : u32, @builtin(instance_index) seg : u32) -> VertexOutput {
    // 1. Gather: this segment's four control values (gathered on the CPU).
    let p0 = control[4u * seg];
    let p1 = control[4u * seg + 1u];
    let p2 = control[4u * seg + 2u];
    let p3 = control[4u * seg + 3u];

    // 2. Weigh: compute the parameter u for this vertex (sample i of
    // params.samples), the vector U = [1 u u² u³], and the blending
    // weights b = U B. Careful: WGSL matrices are column-major, and B was
    // uploaded row by row (see onFrame), so params.B holds Bᵀ.
    // params.B * U. Bᵀ U is the same vector as U B.
    let u = f32(i) / f32(params.samples);
    let U = vec4f(1.0, u, u * u, u * u * u);
    let b = params.B * U;

    // 3. Blend: f = b0 p0 + b1 p1 + b2 p2 + b3 p3.
    let f = b.x * p0 + b.y * p1 + b.z * p2 + b.w * p3;

    var out: VertexOutput;
    out.position = toClip(f);
    out.color = select(vec3f(1.0, 0.6, 0.2), vec3f(0.3, 0.8, 0.9), (seg & 1u) == 1u);
    return out;
}

@vertex
fn vs_polygon(@builtin(vertex_index) i : u32) -> VertexOutput {
    var out : VertexOutput;
    out.position = toClip(points[i % params.pointCount]);
    out.color = vec3f(0.45);
    return out;
}

@vertex
fn vs_point(@builtin(vertex_index) i : u32, @builtin(instance_index) k : u32) -> VertexOutput {
    let corner = vec2f(f32(i & 1u), f32(i >> 1u)) * 2.0 - 1.0;   // a quad as a 4-vertex strip
    var out : VertexOutput;

    var clip = toClip(points[k]);
    // clip.xy += 0.015 * corner.xy;
    // out.position = toClip(points[k] + 0.015 * corner);
    out.position = toClip(points[k]);
    out.color = vec3f(0.95);
    return out;
}

@fragment
fn fs_main(@location(0) color : vec3f) -> @location(0) vec4<f32> {
    return vec4f(color, 1.0);
}
