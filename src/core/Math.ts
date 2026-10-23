/*
  This file should consolidate all existing JS functions for easier management.
  I have caved and am now using classes which will generate extra runtime code,
  so hopefully this doesn't introduce testing difficulties.
 */

import * as JSVec2 from "@/lib/math/vec2.js";
import * as JSVec3 from "@/lib/math/vec3.js";
import * as JSVec4 from "@/lib/math/vec4.js";
import * as JSMat4 from "@/lib/math/mat4.js";
import * as JSTransforms from "@/lib/math/transforms.js";

export class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromArray(arr: any[]): Vec2 {
    return new Vec2(arr[0], arr[1]);
  }

  toArray(): number[] {
    return [this.x, this.y];
  }

  clone(): Vec2 {
    return Vec2.fromArray(JSVec2.clone(this.toArray()));
  }

  static add(a: Vec2, b: Vec2): Vec2 {
    return Vec2.fromArray(JSVec2.add(a.toArray(), b.toArray()));
  }

  static sub(a: Vec2, b: Vec2): Vec2 {
    return Vec2.fromArray(JSVec2.sub(a.toArray(), b.toArray()));
  }

  static scale(a: Vec2, s: number): Vec2 {
    return Vec2.fromArray(JSVec2.scale(a.toArray(), s));
  }

  static dot(a: Vec2, b: Vec2): number {
    return JSVec2.dot(a.toArray(), b.toArray());
  }

  length(): number {
    return JSVec2.length(this.toArray());
  }

  normalize() {
    let xy = JSVec2.normalize(this.toArray());
    this.x = xy[0] ?? this.x;
    this.y = xy[1] ?? this.y;
  }

  static lerp(a: Vec2, b: Vec2, t: number): Vec2 {
    let xy = JSVec2.lerp(a.toArray(), b.toArray(), t);
    return new Vec2(xy[0], xy[1]);
  }

  negate() {
    let xy = JSVec2.negate(this.toArray());
    this.x = xy[0] ?? this.x;
    this.y = xy[1] ?? this.y;
  }
}

export class Vec3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static fromArray(arr: any[]): Vec3 {
    return new Vec3(arr[0], arr[1], arr[2]);
  }

  toArray(): number[] {
    return [this.x, this.y, this.z];
  }

  clone(): Vec3 {
    return Vec3.fromArray(JSVec3.clone(this.toArray()));
  }

  static add(a: Vec3, b: Vec3): Vec3 {
    return Vec3.fromArray(JSVec3.add(a.toArray(), b.toArray()));
  }

  static sub(a: Vec3, b: Vec3): Vec3 {
    return Vec3.fromArray(JSVec3.sub(a.toArray(), b.toArray()));
  }

  static scale(a: Vec3, s: number): Vec3 {
    return Vec3.fromArray(JSVec3.scale(a.toArray(), s));
  }

  static dot(a: Vec3, b: Vec3): number {
    return JSVec3.dot(a.toArray(), b.toArray());
  }

  static cross(a: Vec3, b: Vec3): Vec3 {
    return Vec3.fromArray(JSVec3.cross(a.toArray(), b.toArray()));
  }

  length(): number {
    return JSVec3.length(this.toArray());
  }

  normalize() {
    let xyz = JSVec3.normalize(this.toArray());
    this.x = xyz[0] ?? this.x;
    this.y = xyz[1] ?? this.y;
    this.z = xyz[2] ?? this.z;
  }

  static lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    let xyz = JSVec3.lerp(a.toArray(), b.toArray(), t);
    return new Vec3(xyz[0], xyz[1], xyz[2]);
  }

  negate() {
    let xyz = JSVec3.negate(this.toArray());
    this.x = xyz[0] ?? this.x;
    this.y = xyz[1] ?? this.y;
    this.z = xyz[2] ?? this.z;
  }

  static triangleNormal(p0: Vec3, p1: Vec3, p2: Vec3): Vec3 {
    return Vec3.fromArray(JSVec3.triangleNormal(p0.toArray(), p1.toArray(), p2.toArray()));
  }

  static scalarTriple(a: Vec3, b: Vec3, c: Vec3): number {
    return JSVec3.scalarTriple(a.toArray(), b.toArray(), c.toArray());
  }
}

export class Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  static fromArray(arr: any[]): Vec4 {
    return new Vec4(arr[0], arr[1], arr[2], arr[3]);
  }

  toArray(): number[] {
    return [this.x, this.y, this.z, this.w];
  }

  clone(): Vec4 {
    return Vec4.fromArray(JSVec4.clone(this.toArray()));
  }

  static add(a: Vec4, b: Vec4): Vec4 {
    return Vec4.fromArray(JSVec4.add(a.toArray(), b.toArray()));
  }

  static sub(a: Vec4, b: Vec4): Vec4 {
    return Vec4.fromArray(JSVec4.sub(a.toArray(), b.toArray()));
  }

  static scale(a: Vec4, s: number): Vec4 {
    return Vec4.fromArray(JSVec4.scale(a.toArray(), s));
  }

  static dot(a: Vec4, b: Vec4): number {
    return JSVec4.dot(a.toArray(), b.toArray());
  }

  static lerp(a: Vec4, b: Vec4, t: number): Vec4 {
    let arr = JSVec3.lerp(a.toArray(), b.toArray(), t);
    return new Vec4(arr[0], arr[1], arr[2], arr[3]);
  }

  // perspectiveDivide originally in mat4.js
  static perspectiveDivide(v: Vec4): Vec3 {
    return Vec3.fromArray(JSMat4.perspectiveDivide(v.toArray()));
  }
}

export class Mat4 {
  arr: Float32Array;

  constructor(data: Float32Array) {
    this.arr = data;
  }

  getString(): string {
    let str: string = "";
    for (let i = 0; i < this.arr.length; i++) {
      str += this.arr[i]!.toString().padStart(3, ' ');
      if (i != 0 && i != this.arr.length && (i+1) % 4 === 0)
        str += "\n"
    }
    return str;
  }

  static fromArray(arr: number[]) {
    return new Mat4(new Float32Array(arr));
  }

  toArray(): number[] {
    return [...this.arr];
  }

  static identity(): Mat4 {
    return new Mat4(JSMat4.identity());
  }

  clone(): Mat4 {
    return new Mat4(JSMat4.clone(this.arr));
  }

  static multiply(a: Mat4, b: Mat4): Mat4 {
    return new Mat4(JSMat4.multiply(a.arr, b.arr));
  }

  static multiplyVec4(m: Mat4, v: Vec4): Vec4 {
    return Vec4.fromArray(JSMat4.multiplyVec4(m.toArray(), v.toArray()));
  }

  static multiplyAll(matrices: Mat4[]): Mat4 {

    return Mat4.fromArray(JSMat4.multiplyAll(
      matrices.map((m: Mat4) => m.toArray())
    ));
  }

  static transformPoint(m: Mat4, p: Vec3): Mat4 {
    return Mat4.fromArray(JSMat4.transformPoint(m.toArray(), p.toArray()));
  }

  // perspectiveDivide implemented in Vec4.

  static transpose(m: Mat4): Mat4 {
    return new Mat4(JSMat4.transpose(m.toArray()));
  }

  static invert(m: Mat4, r1: number, r2: number): Mat4 {
    return new Mat4(JSMat4.invert(m.toArray()));
  }
}

export class Transform {
  static translate(_tx: number, _ty: number, _tz: number): Mat4 {
    return new Mat4(JSTransforms.translate(_tx, _ty, _tz));
  };
  static scale(_sx: number, _sy: number, _sz: number): Mat4 {
    return new Mat4(JSTransforms.scale(_sx, _sy, _sz));
  };
  static shear(_xy: number, _xz: number, _yx: number,
               _yz: number, _zx: number, _zy: number): Mat4 {
    return new Mat4(JSTransforms.shear(_xy, _xz, _yx, _yz, _zx, _zy));
  };

  static rotateX(_radians: number): Mat4 {
    return new Mat4(JSTransforms.rotateX(_radians));
  };
  static rotateY(_radians: number): Mat4 {
    return new Mat4(JSTransforms.rotateY(_radians));
  };
  static rotateZ(_radians: number): Mat4 {
    return new Mat4(JSTransforms.rotateZ(_radians));
  };
  static fromEulerZYX(_yaw: number, _pitch: number, _roll: number): Mat4 {
    return new Mat4(JSTransforms.fromEulerZYX(_yaw, _pitch, _roll));
  }

  static lookAt(_eye: Vec3, _target: Vec3, _up: Vec3): Mat4 {
    return new Mat4(JSTransforms.lookAt(_eye, _target, _up));
  };
  static perspective(_eye: Vec3, _target: Vec3, _up: Vec3): Mat4 {
    return new Mat4(JSTransforms.perspective(_eye, _target, _up));
  };
  static ortho(_left: number, _right: number, _bottom: number, _top: number,
               _near: number, _far: number): Mat4 {
    return new Mat4(JSTransforms.ortho(_left, _right, _bottom, _top, _near, _far));
  }
}
