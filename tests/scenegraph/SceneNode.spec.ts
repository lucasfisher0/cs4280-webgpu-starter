import {describe, expect, test} from "vitest";

import {Vec2} from "@/core/math/Vec2";
import {Vec3} from "@/core/math/Vec3";
import {Vec4} from "@/core/math/Vec4";
import {Mat4} from "@/core/math/Mat4";
import * as Transform from "@/core/math/Transform";
import {stringifyMatrix} from "@/core/debug/Mat4";
import {SceneNode} from "@/core/scenegraph/SceneNode";

test("SceneNode", () => {
  expect(true).toBeTruthy();
});
