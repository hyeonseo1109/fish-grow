import type { Vector } from "@shared/lib/math";

export type Fish = {
  id: string;
  position: Vector;
  radius: number;
  speed: number;
  direction: Vector;
  color: string;
};

export type PlayerFish = Fish & {
  score: number;
  eaten: number;
};
