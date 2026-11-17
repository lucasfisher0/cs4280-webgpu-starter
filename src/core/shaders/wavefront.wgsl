/* Blinn-Phong model with optional textures. No lighting. */

struct Uniforms {
    mvp: mat4x4<f32>,         // 0 - Model/View/Projection Matrix
    normal: mat4x4<f32>,      // 16 - Normal Matrix
    ambient: vec3<f32>,       // 32 - Ambient (RGB)
    diffuse: vec4<f32>,       // 48 - Diffuse (RGB), A is used to mark a texture is in usage
    specular: vec3<f32>,      // 64 - Specular (RGB)
    shininess: f32,           // 80 - Shininess Coefficient
    opacity: f32,             // 84 - Opacity (Currently unused)
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(1) @binding(0) var diffuse_texture: texture_2d<f32>;
@group(1) @binding(1) var tex_sampler: sampler;

struct VertexInput {
    @location(0) position : vec3<f32>,
    @location(1) normal   : vec3<f32>,
    @location(2) uv       : vec2<f32>,
};

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) normal         : vec3<f32>,
    @location(1) uv             : vec2<f32>,
};

@vertex
fn vertexMain(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.position = uniforms.mvp * vec4<f32>(in.position, 1.0);
    out.normal = normalize((uniforms.normal * vec4<f32>(in.normal, 0.0)).xyz);
    out.uv = in.uv;
    return out;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4<f32> {
    let baseColor: vec4<f32> = select(
        vec4<f32>(uniforms.diffuse.rgb, 1.0),
        textureSample(diffuse_texture, tex_sampler, in.uv),
        uniforms.diffuse.a >= 1.0);

    let ambient: vec3<f32> = uniforms.ambient * baseColor.rgb;


    // Diffuse
    let norm = normalize(in.normal);
    let lightDir = normalize(uniforms.lightPosition.xyz - in.worldPosition);
    let diffuse = max(dot(norm, lightDir), 0.0) * uniforms.diffuse * uniforms.lightPosition.a;

    // Specular
    let viewDir = normalize(uniforms.cameraPosition - in.worldPosition);
    let halfDir = normalize(lightDir + viewDir);
    let angle = max(dot(norm, halfDir), 0.0);
    let spec = pow(angle, uniforms.exponent);
    let specular = spec * (vec3<f32>(1.0, 1.0, 1.0) * uniforms.lightPosition.a) * uniforms.specularCo;

    let color = ambient + diffuse + specular;
    return vec4<f32>(color, 1.0);
}
