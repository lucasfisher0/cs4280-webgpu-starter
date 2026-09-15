import {lookAt} from "@/lib/math/transforms.js";

/**
 * Custom camera class to encapsulate all behavior, such as positioning and controls.
 */
class Camera {
  #rotation;
  tetherDistance;

  constructor(rotation, tetherDistance) {
    this.#rotation = rotation;
    this.tetherDistance = tetherDistance;
  }

  // need to get time via requestAnimationFrame(renderLoop);
  tick(deltaTime) {

  }
}
