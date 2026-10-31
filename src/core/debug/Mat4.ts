import {Mat4} from "@/core/math/Mat4.ts";

const CLIP_MIN = 1e-14;

function clipValue(num: number) {
  if (Math.abs(num) <= CLIP_MIN)
    return 0;

  return num;
}

export function stringifyMatrix(matrix: Float32Array | Mat4, maxChars: number = 3, stride: number = 4) {
  if (matrix instanceof Mat4)
    matrix = matrix.arr;

  let out: string = "";
  for (let i = 0; i < matrix.length; i++) {
    if (i % stride == 0)
      out += "\n\t";

    let str = clipValue(matrix[i] ?? 0).toString().slice(0, maxChars);
    out += str.padEnd(3) + " ";
  }

  return out;
}

export function compareMatrix(a: Mat4, b: Mat4): [boolean, number[]] {
  let isEqual: boolean = true;
  let idx: number[] = [];

  for (let i = 0; i < 16; i++) {
    if (a.arr[i] == b.arr[i])
      continue;

    isEqual = false;
    idx.push(i);
  }

  return [isEqual, idx];
}

export function compareMatrixError(
  idx: number[],
  actual?: Float32Array | Mat4 | null,
  expected?: Float32Array | Mat4 | null
): string {
  let str = "";
  str += "Matrix was invalid for indices: " + idx.join(", " + ".");
  if (actual)
    str += `\nActual: ${stringifyMatrix(actual)}`
  if (expected)
    str += `\nExpected: ${stringifyMatrix(expected)}`
  return str;
}
