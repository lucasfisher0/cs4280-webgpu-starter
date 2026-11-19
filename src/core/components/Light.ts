import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transform from "@/core/math/Transform.ts"
import {Ray, HitRecord} from "@/core/raytracing/Ray.ts";
import {SceneNode, type SceneNodeDescriptor} from "@/core/scenegraph/SceneNode.ts";
import {FColor} from "@/core/Color.ts";




export type LightType = "point" | "directional" | "spot";
export interface LightNodeDescriptor extends SceneNodeDescriptor {
  color?: FColor;
  type?: LightType;
  radius?: number;
  innerCutoff?: number;
  outerCutoff?: number;
}

export abstract class Light extends SceneNode {

  color: FColor;
  type: LightType;

  radius: number;
  innerCutoff: number; // Inner cone angle (Spotlight)
  outerCutoff: number; // Outer cone angle (Spotlight)

  constructor(desc: LightNodeDescriptor) {
    super(desc);
    this.color = desc.color ?? new FColor(1.0, 1.0, 1.0, 0.8);
    this.type = desc.type ?? "point";
    this.radius = desc.radius ?? 5.0;
    this.innerCutoff = desc.innerCutoff ?? 500;
    this.outerCutoff = desc.outerCutoff ?? 500;
  }






}

/*
struct SpotLight {
    position: vec3<f32>,
    innerCutoff: f32,      // cos(innerAngle)
    direction: vec3<f32>,
    outerCutoff: f32,      // cos(outerAngle)
    color: vec3<f32>,
    intensity: f32,
    range: f32,            // or constant/linear/quadratic factors
};
 */
