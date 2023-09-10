import { vec2, vec3 } from "gl-matrix";
import type { Skeleton } from "../renderer/geometries/model/skeleton";
import type { Genotype } from "../systems/gene";
import { Walker } from "../systems/walker";

export type Entity = {
  id: number;
  genotype: Genotype;
  parents?: [Entity, Entity];
};

export type Draggable = {
  dragged_anchor?: vec3;
  dragged_v?: vec3;
};

export type Triceratops = Skeleton & { target: vec2 } & Entity &
  Draggable &
  Walker;

export const triceratops: Triceratops[] = [];
