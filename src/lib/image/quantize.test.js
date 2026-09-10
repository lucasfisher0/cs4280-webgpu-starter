import {describe, expect, test} from 'vitest'
import {quantizeChannel, posterizeChannels} from './quantize';

describe('Color Quantization', () => {

  test('Quantize 0-255 should correctly step', () => {
    const levels = 5; // step size of 51

    for (const val of [0, 30, 50, 80, 120, 150, 180, 220, 255, 300]) {

      const quantized = quantizeChannel(val, levels);
      expect(quantized % 51).toEqual(0);
      console.log(`Value '${val}' quantized to '${quantized}' using ${levels} levels.`)
    }
  });

  test('Posterization should work on all channels', () => {
    const levels = 5; // step size of 51

    const imageData = new ImageData(
      new Uint8ClampedArray([
        ...[30, 50, 80, 255],
        ...[80, 120, 150, 255]]), 2, 1);

    const posterized = posterizeChannels(imageData, levels);
    expect(posterized.data.slice(0, 3)).toEqual(new Uint8ClampedArray([51, 51, 102]));
    expect(posterized.data.slice(4, 7)).toEqual(new Uint8ClampedArray([102, 102, 153]));
  });
});
