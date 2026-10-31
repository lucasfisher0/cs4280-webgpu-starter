import * as JSVec3 from "@/lib/math/vec3";

export class Vec3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /* Object Meta */
  clone(): Vec3 {
    return Vec3.fromArray(JSVec3.clone(this.toArray()));
  }

  static Zero(): Vec3 {
    return new Vec3(0, 0, 0);
  }

  // Converts a flat array of numbers to Vec3
  static fromArray(arr: any[]): Vec3 {
    return new Vec3(arr[0], arr[1], arr[2]);
  }

  // Returns Vec3 as an array of numbers
  toArray(): number[] {
    return [this.x, this.y, this.z];
  }

  // Converts an array of Vec3 into a flat array of numbers
  static flatArray(arr: Vec3[]): number[] {
    return arr.flatMap(vec => vec.toArray());
  }

  // Converts an array of numbers into an array of Vec3
  static fromList(list: number[] | Float32Array): Vec3[] {
    let arr: Vec3[] = [];
    for (let i = 0; i < list.length; i += 3) {
      arr.push(new Vec3(
        list[i]!,     // TODO: is there any way to do val ?? throw exception inline as in C#?
        list[i + 1]!, // Also, there should be more safety here!
        list[i + 2]!,
      ));
    }
    return arr;
  }

  /* Object Operations & Properties */
  length(): number {
    return JSVec3.length(this.toArray());
  }

  normalize() {
    let xyz = JSVec3.normalize(this.toArray());
    this.x = xyz[0] ?? this.x;
    this.y = xyz[1] ?? this.y;
    this.z = xyz[2] ?? this.z;
    return this;
  }

  negate() {
    let xyz = JSVec3.negate(this.toArray());
    this.x = xyz[0] ?? this.x;
    this.y = xyz[1] ?? this.y;
    this.z = xyz[2] ?? this.z;
    return this;
  }

  /* Static Operations */
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

  static lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    let xyz = JSVec3.lerp(a.toArray(), b.toArray(), t);
    return new Vec3(xyz[0], xyz[1], xyz[2]);
  }

  static triangleNormal(p0: Vec3, p1: Vec3, p2: Vec3): Vec3 {
    return Vec3.fromArray(JSVec3.triangleNormal(p0.toArray(), p1.toArray(), p2.toArray()));
  }

  static scalarTriple(a: Vec3, b: Vec3, c: Vec3): number {
    return JSVec3.scalarTriple(a.toArray(), b.toArray(), c.toArray());
  }
}
