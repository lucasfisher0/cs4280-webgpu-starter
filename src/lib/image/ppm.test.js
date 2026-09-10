import {describe, expect, test} from 'vitest'
import {encodePPM} from './ppm';

describe('PPM Encoding', () => {

  test('Matches given example', () => {
    const col1 = [255, 0, 0, 255];
    const col2 = [0, 255, 0, 255];

    const pixels = new Uint8ClampedArray([...col1, ...col2]);
    const imageData = new ImageData(pixels, 2, 1);
    const bytes = encodePPM(imageData);

    expect(bytes.byteLength).toEqual(17);
    expect(bytes[0]).toEqual(80);
    expect(bytes[1]).toEqual(54);
    expect(bytes[14]).toEqual(0);
    expect(bytes[15]).toEqual(255);
    expect(bytes[16]).toEqual(0);
  });
});
