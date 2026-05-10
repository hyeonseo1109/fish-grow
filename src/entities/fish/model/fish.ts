import { randomBetween, type Vector } from "@shared/lib/math";

import type { Fish, PlayerFish } from "./types";

export const SEA_WIDTH = 960;
export const SEA_HEIGHT = 620;
export const PREDATOR_IMAGE_COUNT = 6;
const SPAWN_EDGE_PADDING_MULTIPLIER = 1.7;

type SpawnExclusion = {
  position: Vector;
  radius: number;
};

export function createPlayerFish(): PlayerFish {
  return {
    id: "player",
    position: { x: SEA_WIDTH / 2, y: SEA_HEIGHT / 2 },
    radius: 24,
    speed: 260,
    direction: { x: 1, y: 0 },
    score: 0,
    eaten: 0,
  };
}

export function createFoodFish(
  id: string,
  playerRadius: number,
  exclusion?: SpawnExclusion,
): Fish {
  const isBiggerThanPlayer = Math.random() < 0.32;
  const radius = isBiggerThanPlayer
    ? randomBetween(playerRadius * 1.04, playerRadius * 1.42)
    : randomBetween(8, Math.max(14, playerRadius * 0.9));
  const edgePadding = radius * SPAWN_EDGE_PADDING_MULTIPLIER + 12;
  const position = createSpawnPosition(edgePadding, radius, exclusion);
  const direction = normalize({
    x: randomBetween(-1, 1),
    y: randomBetween(-0.35, 0.35),
  });

  return {
    id,
    position,
    radius,
    speed: randomBetween(18, 64),
    direction,
    imageIndex: Math.floor(Math.random() * PREDATOR_IMAGE_COUNT) + 1,
  };
}

function createSpawnPosition(
  edgePadding: number,
  radius: number,
  exclusion?: SpawnExclusion,
): Vector {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const position = {
      x: randomBetween(edgePadding, SEA_WIDTH - edgePadding),
      y: randomBetween(edgePadding, SEA_HEIGHT - edgePadding),
    };

    if (!exclusion || isOutsideExclusion(position, radius, exclusion)) {
      return position;
    }
  }

  return {
    x:
      exclusion && exclusion.position.x < SEA_WIDTH / 2
        ? SEA_WIDTH - edgePadding
        : edgePadding,
    y:
      exclusion && exclusion.position.y < SEA_HEIGHT / 2
        ? SEA_HEIGHT - edgePadding
        : edgePadding,
  };
}

function isOutsideExclusion(
  position: Vector,
  radius: number,
  exclusion: SpawnExclusion,
) {
  const minimumDistance = exclusion.radius + radius + 170;

  return (
    Math.hypot(position.x - exclusion.position.x, position.y - exclusion.position.y) >=
    minimumDistance
  );
}

export function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}
