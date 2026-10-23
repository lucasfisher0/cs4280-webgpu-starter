// This file does not work in TypeScript as the types here are enforced.
// As such, it only functions for assignment 1 tests, which will be removed in the future
// if additional mocking is required later.

// ImageData mock
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    constructor(data, sw, sh) {
      this.width = sw;
      this.height = sh;
      this.data = data ?? new Uint8ClampedArray(sw * sh * 4);
    }
  };
}
