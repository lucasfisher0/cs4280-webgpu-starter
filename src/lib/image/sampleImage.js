/**
 * A procedurally drawn sample image, so Assignment 1 has something to
 * compress before the user uploads their own photo. Deliberately busy
 * (gradient sky, sharp-edged shapes, a soft circular gradient) — a good
 * mix of smooth regions (where quantization/blur artifacts are subtle)
 * and hard edges (where they're obvious), rather than a flat test card.
 *
 * @param {number} [size] both width and height, in pixels
 * @returns {HTMLCanvasElement}
 */
export function createSampleImage(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, "#1e3a8a");
  sky.addColorStop(0.55, "#f97316");
  sky.addColorStop(1, "#fde68a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size);

  // A soft "sun" — smooth radial gradient, good for showing banding once quantized.
  const sun = ctx.createRadialGradient(
    size * 0.7,
    size * 0.35,
    0,
    size * 0.7,
    size * 0.35,
    size * 0.28,
  );
  sun.addColorStop(0, "#fff7ed");
  sun.addColorStop(1, "rgba(255, 247, 237, 0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, size, size);

  // Layered mountain silhouettes — hard edges and flat color fills.
  const ranges = [
    { y: size * 0.62, color: "#334155", amplitude: size * 0.08 },
    { y: size * 0.74, color: "#1e293b", amplitude: size * 0.06 },
    { y: size * 0.86, color: "#0f172a", amplitude: size * 0.1 },
  ];
  for (const range of ranges) {
    ctx.fillStyle = range.color;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, range.y);
    for (let x = 0; x <= size; x += size / 16) {
      const y = range.y - Math.abs(Math.sin(x * 0.05 + range.y)) * range.amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();
  }

  // A few saturated foreground shapes, for clean palette/quantization contrast.
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(size * 0.22, size * 0.8, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(size * 0.4, size * 0.72, size * 0.12, size * 0.12);

  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.moveTo(size * 0.62, size * 0.86);
  ctx.lineTo(size * 0.7, size * 0.7);
  ctx.lineTo(size * 0.78, size * 0.86);
  ctx.closePath();
  ctx.fill();

  return canvas;
}
