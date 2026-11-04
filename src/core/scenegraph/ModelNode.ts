
import {Material, DEFAULT_MATERIAL} from "@/core/render/Material";
import {SceneNode, type SceneNodeDescriptor} from "@/core/scenegraph/SceneNode";
import type {Mesh} from "@/core/render/Mesh.ts";
import {Mat4} from "@/core/math/Mat4.ts";

interface ModelNodeDescriptor extends SceneNodeDescriptor{
  mesh?: Mesh | null;
}
export type {ModelNodeDescriptor};


export class ModelNode extends SceneNode {
  _mesh: Mesh | null | undefined; // TODO: Ensure safety here

  constructor(desc: ModelNodeDescriptor) {
    super(desc);
    this._mesh = desc.mesh;
  }
}
