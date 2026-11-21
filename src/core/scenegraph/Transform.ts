import {Vec2} from "@/core/math/Vec2.ts";
import {Vec3} from "@/core/math/Vec3.ts";
import {Vec4} from "@/core/math/Vec4.ts";
import {Mat4} from "@/core/math/Mat4.ts";
import * as Transforms from "@/core/math/Transforms.ts"

const composeTransform = (translation: Vec3, rotation: Vec3, scale: Vec3) => {
  const tm = Transforms.translateVec3(translation);
  const rm = Transforms.fromEulerZYX(rotation.z, rotation.y, rotation.x);
  const sm = Transforms.scale(scale.x, scale.y, scale.z);
  return Mat4.multiplyAll([tm, rm, sm]);
}

export class Transform {
  translation: Vec3;
  rotation: Vec3;
  scale: Vec3;

  #local: Mat4;
  #parent: Mat4;
  #world: Mat4;

  public set parent(p: Mat4) {
    this.#parent = p;
    this.recalculate();
  }

  public get transform(): Mat4 {
    return this.#local;
  };

  public get worldTransform(): Mat4 {
    return this.#world;
  };

  constructor(translation?: Vec3, rotation?: Vec3, scale?: Vec3) {
    this.translation = translation ?? Vec3.Zero();
    this.rotation = rotation ?? Vec3.Zero();
    this.scale = scale ?? Vec3.One();
    this.#local = composeTransform(this.translation, this.rotation, this.scale);
    this.#parent = Mat4.Identity();
    this.#world = Mat4.Identity();
  }

  /**
   * Sets local transform on this scene node as a composite of Translation, Rotation, and Scale vectors.
   * @param translation
   * @param rotation
   * @param scale
   */
  public set(translation?: Vec3, rotation?: Vec3, scale?: Vec3) {
    if (translation)
      this.translation = translation;
    if (rotation)
      this.rotation = rotation;
    if (scale)
      this.scale = scale;
    this.recalculate();
  }

  /**
   * Applies separate TRS to the existing transform.
   * @param translation
   * @param rotation
   * @param scale
   */
  public add(translation?: Vec3, rotation?: Vec3, scale?: Vec3) {
    if (translation)
      this.translation = Vec3.add(this.translation, translation);
    if (rotation)
      this.rotation = Vec3.add(this.rotation, rotation);
    if (scale)
      this.scale = Vec3.add(this.scale, scale);
    this.recalculate();
  }

  public recalculate() {
    this.#local = composeTransform(this.translation, this.rotation, this.scale);
    this.#world = Mat4.multiply(this.#parent, this.#local);
  }

  /** Changes parent while keeping world position the same. */
  public reparent(p: Mat4): void {
    this.#local = this.#local.multiply(this.#parent.invert());
    this.#parent = p;
    this.recalculate();
  }
}
