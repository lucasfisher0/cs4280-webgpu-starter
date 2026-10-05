
const CLIP_MIN = 1e-14;

function clipValue(num: number) {
  if (Math.abs(num) <= CLIP_MIN)
    return 0;

  return num;
}

export function stringifyMatrix(matrix: Float32Array, stride: number = 4) {
  let out: string = "";
  for (let i = 0; i < matrix.length; i++) {
    if (i % stride == 0)
      out += "\n\t";

    let str = clipValue(matrix[i] ?? 0).toString();
    out += str.padEnd(3) + " ";
  }

  return out;
}
