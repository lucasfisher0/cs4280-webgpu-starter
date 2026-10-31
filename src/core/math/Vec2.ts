import * as JSVec2 from "@/lib/math/vec2.js";

export class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /* Object Meta */
  clone(): Vec2 {
    return Vec2.fromArray(JSVec2.clone(this.toArray()));
  }

  static Zero(): Vec2 {
    return new Vec2(0, 0);
  }

  // Converts a flat array of numbers to Vec2
  static fromArray(arr: any[]): Vec2 {
    return new Vec2(arr[0], arr[1]);
  }

  // Returns Vec2 as a 2-value array
  toArray(): number[] {
    return [this.x, this.y];
  }

  // Converts an array of Vec2 into a flat array of numbers
  static flatArray(arr: Vec2[]): number[] {
    return arr.flatMap(vec => vec.toArray());
  }

  // Converts an array of numbers into an array of Vec2
  static fromList(list: number[] | Float32Array): Vec2[] {
    let arr: Vec2[] = [];
    for (let i = 0; i < list.length; i += 2) {
      arr.push(new Vec2(
        list[i]!,     // TODO: is there any way to do val ?? throw exception inline as in C#?
        list[i + 1]! // Also, there should be more safety here!
      ));
    }
    return arr;
  }

  /* Object Operations & Properties */
  length(): number {
    return JSVec2.length(this.toArray());
  }

  normalize() {
    let xy = JSVec2.normalize(this.toArray());
    this.x = xy[0] ?? this.x;
    this.y = xy[1] ?? this.y;
  }

  negate() {
    let xy = JSVec2.negate(this.toArray());
    this.x = xy[0] ?? this.x;
    this.y = xy[1] ?? this.y;
  }

  /* Static Operations */
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

  static lerp(a: Vec2, b: Vec2, t: number): Vec2 {
    let xy = JSVec2.lerp(a.toArray(), b.toArray(), t);
    return new Vec2(xy[0], xy[1]);
  }
}
