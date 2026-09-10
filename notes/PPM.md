PPM is a minimal, uncompressed raster format — useful for saving exactly what a program computed.

A binary P6 PPM file has:

An ASCII header: P6, width, height, and max value 255, whitespace-separated.
Raw pixel bytes immediately after the header — one byte each for R, G, B, no alpha.
A 2×1 image (one red pixel, one green pixel) encodes as header P6\n2 1\n255\n (11 bytes) followed by 6 pixel bytes — 17 bytes total.




Minimal Subset
The PPM format is so simple that many programmers write programs to process it directly, without using a library such as libnetpbm, reverse engineering a subset of the format from examples rather than using the specification. Therefore, if you want to produce an image that as many programs as possible can read, you should stick to the following subset.

The image consists of the following bytes:

"P6" followed by newline
width and height separated by a space (e.g. "50 100"), followed by newline
maxval, followed by newline. At most 255; even more minimally, 255 exactly.
The raster
There is only one image in the file.