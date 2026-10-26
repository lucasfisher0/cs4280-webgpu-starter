
import {Material, DEFAULT_MATERIAL} from "@/core/render/Material";
import {SceneNode} from "@/core/scenegraph/SceneNode";
import type {Mesh} from "@/core/render/Mesh.ts";



export class ModelNode extends SceneNode {
  mesh: Mesh;
  // material: Material | null;

  constructor(mesh: Mesh,
              // material: Material,
              ...args: ConstructorParameters<typeof SceneNode>) {
    super(...args);
    this.mesh = mesh;
    // this.material = material;
  }
}
