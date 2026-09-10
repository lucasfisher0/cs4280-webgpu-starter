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
