
Goals:
- Build many objects from one mesh by composing per-part and per-object transforms.
- Store per-instance data in a vertex buffer with stepMode: "instance", and draw every instance with a single drawIndexed call.
- Transform normals correctly for scaled instances without a matrix inverse in WGSL.
- Store several materials in one texture_2d_array, build its mipmaps yourself, and select a layer per instance.
- Map textures at a constant physical size with world-scaled texture coordinates, and explain the aliasing that mipmaps remove.
- Explain your own instancing and texturing code out loud, on camera.



