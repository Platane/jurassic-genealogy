import { vec3, mat4 } from "gl-matrix";
import { triceratops } from "../entities/triceratops";
import { triceratopsRayCollision } from "../utils/collision/triceratopsRayCollision";
import { fruits } from "../entities/fruits";
import { sphereRayCollision } from "../utils/collision/sphereRayCollision";

export const raycastToScene = (
  ray_origin: vec3,
  ray_direction: vec3,
  fruit = true
) => {
  let d_min = Infinity;
  let i_tri_min = -1;

  for (let i = triceratops.length; i--; ) {
    const d = triceratopsRayCollision(
      triceratops[i],
      ray_origin,
      ray_direction
    );

    if (d < d_min) {
      i_tri_min = i;
      d_min = d;
    }
  }

  let i_fruit_min = -1;
  for (let i = fruits.length; i--; ) {
    const d = sphereRayCollision(
      fruits[i].p,
      fruits[i].s * 0.45,
      ray_origin,
      ray_direction
    );

    if (d < d_min) {
      i_fruit_min = i;
      d_min = d;
    }
  }

  if (i_fruit_min >= 0) return { type: "fruit" as const, i: i_fruit_min };
  if (i_tri_min >= 0) return { type: "tri" as const, i: i_tri_min };
};
