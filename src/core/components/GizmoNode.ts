import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts"
import {Mesh} from "@/core/render/Mesh.ts"
import {SceneNode} from "@/core/scenegraph/SceneNode.ts";
import type {IDrawable} from "@/core/render/IDrawable.ts";

import shaderCode from "@/core/shaders/gizmo.wgsl?raw";
import {InputManager} from "@/core/InputManager.ts";
import {type BoundingBox, makeBoxFromPoint} from "@/core/raytracing/BVH.ts";

export enum EGizmoShape {
  Axis
}

export interface GizmoDescriptor { }

// export function makeBoxFromPoint(p: Vec3, width: number, height?: number, length?: number) {

export class Gizmo extends SceneNode implements IDrawable {
  boundingBox?: BoundingBox;
  boxSize: Vec3 = new Vec3(0.3);

  constructor(desc: GizmoDescriptor) {
    super(desc);
  }

  isVisible(): boolean {
    return true;
  }

  public override set worldTransform(transform: Mat4) {
    super.worldTransform = transform;
    this.boundingBox = makeBoxFromPoint(this.worldTransform.position(), this.boxSize.x, this.boxSize.y, this.boxSize.z);
  }

  getBounds(): BoundingBox {
    this.boundingBox ??= makeBoxFromPoint(this.worldTransform.position(), this.boxSize.x, this.boxSize.y, this.boxSize.z);
    return this.boundingBox;
  }

  draw(pass: GPURenderPassEncoder, slot: number): void {
    throw new Error("Gizmo.draw(): Not implemented!");
  }
}
