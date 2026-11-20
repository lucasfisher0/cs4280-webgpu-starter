
# Todo Checklist


## Assignment 2
- [ ] translate / scale / shear / rotateX / rotateY / rotateZ
- [ ] lookAt / perspective / ortho / fromEulerZYX
- [ ] WebGPU pipeline (buffers, shader, depth-stencil, bind group)
- [ ] Orbit camera (drag-to-orbit, pitch clamp, lookAt integration)
- [ ] Model transform composition; controls wired (distance, scale, shear x/y/z, auto-spin)
- [ ] Local axis guides (second pipeline sharing the cube's MVP/bind group, correct depth occlusion)
- [ ] Code quality (RUN LINTER BEFORE SUBMISSION!)
- [ ] Post-submission questions

Local -> World -> View -> NDC (Normalized Device Coordinates)

* WebGPU is left-handed. NDC map Z from 0.0 near to 1.0 far


## Assignment 6
- [X] SceneNode: Transform should now become a composite of separate TRS
- [ ] Test Ray->Plane
- [ ] Implement ray collisions for sphere and triangle
- [ ] GUI setup, don't hook up yet
- [ ] Light implementation w/ new TRS composition
- [ ] Material setup for next step
- [ ] Create the room boxes
- [ ] Setup the shaders for the project (simple since everything is done on CPU, rendered onto a single triangle)
- [ ] Finalize camera/ray generation
- [ ] Test simple render with just the room boxes
- [ ] Import the car model
- [ ] Shading
- [ ] Shadows
- [ ] Reflections
- [ ] Complete GUI connections

