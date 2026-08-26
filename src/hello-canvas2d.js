// Hello Canvas2D — the plain-Canvas-API counterpart to hello-triangle.js:
// the same setup → resize → render-loop shape, no WebGPU device or
// pipeline underneath it. Read alongside hello-triangle.js to see which
// parts of "how a page here is built" are inherent to any rendering API
// (resize handling, a persistent scene, a frame loop) and which parts
// (adapter/device/pipeline/shaders) are WebGPU-specific.

const canvas = document.getElementById("canvas2d");
const statusEl = document.getElementById("status2d");

function showStatus(message) {
  statusEl.hidden = false;
  statusEl.textContent = message;
}

function main() {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    showStatus("This browser does not support the Canvas2D API.");
    return;
  }

  // A tiny orbiting scene -- no ImageData, no pixel-level work (that's
  // Assignment 1's territory); just shapes, a transform stack, and a
  // frame loop, drawn from scratch every tick like every WebGPU renderer
  // in this repo already does. The moon orbits the earth, which orbits
  // the sun -- a preview of parent-child (hierarchical) transforms.
  const scene = {
    sun: { radius: 26, color: "#ffcf6b" },
    earth: { distance: 70, radius: 10, color: "#5b9dff", speed: 0.6 },
    moon: { distance: 18, radius: 4, color: "#ff6b6b", speed: 1.8 },
  };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    // Draw in CSS-pixel units regardless of backing resolution -- the same
    // role a devicePixelRatio-aware canvas.width/height plays for
    // WebGPU's swap chain, just applied via the 2D context's own
    // transform instead of a separate render-target size.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  function frame(elapsedMs) {
    const elapsed = elapsedMs / 1000;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.fillStyle = "#06070d";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);

    ctx.beginPath();
    ctx.arc(0, 0, scene.sun.radius, 0, Math.PI * 2);
    ctx.fillStyle = scene.sun.color;
    ctx.fill();

    ctx.save();
    ctx.rotate(elapsed * scene.earth.speed);
    ctx.translate(scene.earth.distance, 0);
    ctx.beginPath();
    ctx.arc(0, 0, scene.earth.radius, 0, Math.PI * 2);
    ctx.fillStyle = scene.earth.color;
    ctx.fill();

    // Nested inside earth's save/restore, so this rotate+translate
    // composes with earth's -- the moon orbits earth's current position,
    // not the sun's, exactly like a child node inheriting its parent's
    // transform in a scene graph.
    ctx.save();
    ctx.rotate(elapsed * scene.moon.speed);
    ctx.translate(scene.moon.distance, 0);
    ctx.beginPath();
    ctx.arc(0, 0, scene.moon.radius, 0, Math.PI * 2);
    ctx.fillStyle = scene.moon.color;
    ctx.fill();
    ctx.restore();

    ctx.restore();
    ctx.restore();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
