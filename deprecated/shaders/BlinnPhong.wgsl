const PI = 3.14159265359;

struct Uniforms {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    normalMatrix : mat4x4<f32>,
    cameraPosition : vec3<f32>,
    ambientStrength: f32,
    lightPosition: vec4<f32>,     // RGB, Alpha is strength
    diffuse: vec3<f32>,           // RGB
    exponent: f32,
    specularCo: f32,
    _pad0: vec3<f32>
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var diffuse_texture: texture_2d<f32>;
@group(0) @binding(2) var texture_sampler: sampler;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
};
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) normal: vec3<f32>,
    @location(1) worldPosition: vec3<f32>,
    @location(2) uv: vec2<f32>,
};

@vertex
fn vertexMain(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;

    let worldPosition = uniforms.modelMatrix * vec4<f32>(in.position, 1.0);
    out.worldPosition = worldPosition.xyz;

    out.position = uniforms.projectionMatrix * uniforms.viewMatrix * worldPosition;
    out.normal = normalize((uniforms.normalMatrix * vec4<f32>(in.normal, 0.0)).xyz);
    out.uv = in.uv;

    return out;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
    let texColor = textureSample(diffuse_texture, texture_sampler, in.uv);
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
