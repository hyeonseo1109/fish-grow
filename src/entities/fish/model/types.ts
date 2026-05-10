import type { Vector } from "@shared/lib/math";

export type Fish = {
  id: string;
  position: Vector;
  radius: number;
  speed: number;
  direction: Vector;
  imageIndex: number;
};

export type PlayerFish = Omit<Fish, "imageIndex"> & {
  score: number;
  eaten: number;
};
