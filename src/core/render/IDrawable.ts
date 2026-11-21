import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts";
import type {BoundingBox} from "@/core/collision/Shapes.ts";

export enum EDrawLayer {
  WORLD,
  OVERLAY,
  UI
}

/**
 * Main interface for all drawable SceneNodes, or special classes.
 */
export interface IDrawable {
  isVisible(): boolean;
  getBounds(): BoundingBox | undefined;
  getLayer(): EDrawLayer;
  draw(queue: GPUQueue, pass: GPURenderPassEncoder, slot: number): void;
}
//export type {IDrawable};
