## PARAMETERS
Palette size: 1024

Levels per channel: 20

Block size: 2

## 1. PSNR & Visual Comparison

|                     | Sample | Personal |
| ------------------- | ------ | -------- |
| Indexed Color       | 22.85  | 18.63    |
| Color quantization  | 39.51  | 39.35    |
| Block Average       | 37.44  | 24.93    |

The personal photo I chose is a small section of a much larger photo, however shows a brick wall with shadows and lots of detail, while the sample photo has multiple area sharing the same color.
Indexed color worked very well for my photo while not being able to cover the distinct RGB shapes in the sample. Color Quantization worked well in both, as the brightening/darkening of many areas
goes perceptually almost un-noticed in the personal photo, and only causing small amounts of banding in the sample. Block Averaging, while being very destructive in both photos, was entirely the
greatest loss of detail amongst the techniques. In my photo, the bricks and small tree shadows amonst other details are simply blurred even at a block size of 2. At any larger sizes, it is apparent
this technique was used and in my opinion would be better handled by simply downscaling it as the result was not worth it.


## 2. Storage versus quality

|                     | Sample | Personal |
| ------------------- | ------ | -------- |
| Indexed Color       | 57.3%  | 57.3%    |
| Color quantization  | 37.5%  | 37.5%    |
| Block Average       | 75.0%  | 75.0%    |

Quantization can be though of as limiting the possible values by each channel, without further optimization it would be saved in the same limited space which is entirely determined by
the number of levels, hence the space saved is indentical when performed alone. Block averaging, if saved as blocks, would be equivalent to a direct downscale while also not affecting how
the data is saved, leading to no significant difference when being universally applied without other techniques.

In storage.js, you can see both formulas utilize only height, width, and number of channels, meaning the space saved would not be affected by the image content without other changes
to how data is saved.

## 3. Interpret a PSNR difference

Block size resulted in PSNR values of 37.4dB and 24.9dB for the sample and personal photos respectively. A 10dB increase would mean the MSE is approximately 10x less. While above I've mentioned
the sample photo has more areas of a singular color, the personal photo lost more information because it has more details in a smaller space. These singular color-areas only lost edge information
while the fine details of the personal photo were blurred, leading to a higher error.


## 4. Median-cut algorithm

Palette size: 4 (effectively 5, as the given value is a minimum)
```
Cutting channel 0 with width: 239
Cutting channel 2 with width: 206
Cutting channel 2 with width: 214
```
