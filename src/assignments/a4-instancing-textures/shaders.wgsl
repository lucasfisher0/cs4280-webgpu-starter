const PI = 3.14159265359;

struct Uniforms {
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    cameraPosition : vec3<f32>,
    ambientStrength: f32,
    lightPosition: vec4<f32>,     // RGB, Alpha is strength
    diffuse: vec3<f32>,           // RGB
    exponent: f32,
    specularCo: f32,
    _pad0: vec3<f32>
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var diffuse_textures: texture_2d_array<f32>;
@group(0) @binding(2) var texture_sampler: sampler;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,

    // per-instance matrix, delivered as its 4 columns
    @location(2) m0 : vec4<f32>,
    @location(3) m1 : vec4<f32>,
    @location(4) m2 : vec4<f32>,
    @location(5) m3 : vec4<f32>,
    @location(6) mIndex: f32,
    @builtin(instance_index) iid : u32,
};
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) normal: vec3<f32>,
    @location(1) worldPosition: vec3<f32>,
    @location(2) uv: vec2<f32>,
    @location(3) mIndex: f32,
};

@vertex
fn vertexMain(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    let instance = mat4x4<f32>(in.m0, in.m1, in.m2, in.m3);

    let worldPosition = instance * vec4<f32>(in.position, 1.0);
    out.worldPosition = worldPosition.xyz;

    out.position = uniforms.projectionMatrix * uniforms.viewMatrix * worldPosition;

    let sx = in.m0[0];
    let sy = in.m1[1];
    let sz = in.m2[2];

    let n = vec3<f32>(
        in.normal.x / (sx*sx),
        in.normal.y / (sy*sy),
        in.normal.z / (sz*sz));

    out.normal = (instance * vec4f(n, 0.0)).xyz;
    out.uv = vec2<f32>(1.0, 1.0);
    out.mIndex = in.mIndex;
    return out;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
    let texColor = vec4<f32>(uniforms.diffuse, 1.0);
    // let texColor = textureSample(diffuse_texture, texture_sampler, in.uv, in.mIndex);
    let ambient: vec3<f32> = vec3<f32>(1.0, 1.0, 1.0) * uniforms.ambientStrength * texColor.rgb;

    // Diffuse
    let norm = normalize(in.normal);
    let lightDir = normalize(uniforms.lightPosition.xyz - in.worldPosition);
    let diffuse = max(dot(norm, lightDir), 0.0) * texColor.rgb * uniforms.lightPosition.a;

    // Specular
    let viewDir = normalize(uniforms.cameraPosition - in.worldPosition);
    let halfDir = normalize(lightDir + viewDir);
    let angle = max(dot(norm, halfDir), 0.0);
    let spec = pow(angle, uniforms.exponent);
    let specular = spec * (vec3<f32>(1.0, 1.0, 1.0) * uniforms.lightPosition.a) * uniforms.specularCo;

    let color = ambient + diffuse + specular;
    return vec4<f32>(color, 1.0);
}
