import {describe, expect, test} from 'vitest'
import {medianCutPalette, nearestPaletteIndex} from './palette';


describe('Indexed Color', () => {

  test('should correctly select color palette', () => {
    // https://meyerweb.com/eric/tools/color-blend/ easy color picker
    const col1 = [255, 51, 51, 255];
    const col2 = [255, 204, 153, 255];

    const pixels1 = new Uint8ClampedArray([...col1, ...col2]);
    const img1 = new ImageData(pixels1, 2, 1);
    const palette1 = medianCutPalette(img1, 2);
    expect(palette1).toEqual([[255, 51, 51], [255, 204, 153]]);

    const pixels2 = new Uint8ClampedArray([...col1, ...col1, ...col2, ...col2]);
    const img2 = new ImageData(pixels2, 2, 2);
    const palette2 = medianCutPalette(img2, 2);
    expect(palette2).toEqual([[255, 51, 51], [255, 204, 153]]);
  });

  test('should find the closest index', () => {

    let palette = [
      [255, 0, 0],
      [128, 128, 128],
      [128, 150, 128],
    ];

    expect(nearestPaletteIndex([149, 128, 128], palette)).toBe(1);//.toBe(1));
    expect(nearestPaletteIndex([142, 140, 128], palette)).toBe(2);
  });

});
