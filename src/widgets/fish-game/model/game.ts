import { clamp, distance, type Vector } from "@shared/lib/math";
import {
  createFoodFish,
  createPlayerFish,
  SEA_HEIGHT,
  SEA_WIDTH,
  type Fish,
  type PlayerFish
} from "@entities/fish";

export type GameState = {
  player: PlayerFish;
  foods: Fish[];
  startedAt: number;
  status: "playing" | "won" | "gameOver";
};

export const FOOD_COUNT = 28;
export const WIN_RADIUS = 86;

export function createInitialGameState(): GameState {
  const player = createPlayerFish();

  return {
    player,
    foods: Array.from({ length: FOOD_COUNT }, (_, index) =>
      createFoodFish(`food-${index}`, player.radius)
    ),
    startedAt: performance.now(),
    status: "playing"
  };
}

export function advanceGame(
  state: GameState,
  movement: Vector,
  deltaSeconds: number
): GameState {
  if (state.status !== "playing") {
    return state;
  }

  const playerDirection =
    movement.x === 0 && movement.y === 0 ? state.player.direction : movement;

  const player: PlayerFish = {
    ...state.player,
    direction: playerDirection,
    position: {
      x: clamp(
        state.player.position.x + movement.x * state.player.speed * deltaSeconds,
        state.player.radius,
        SEA_WIDTH - state.player.radius
      ),
      y: clamp(
        state.player.position.y + movement.y * state.player.speed * deltaSeconds,
        state.player.radius,
        SEA_HEIGHT - state.player.radius
      )
    }
  };

  const movedFoods = state.foods.map((food) => moveFood(food, deltaSeconds));
  const remainingFoods: Fish[] = [];
  let eaten = 0;
  let growth = 0;
  let hitPredator = false;

  for (const food of movedFoods) {
    const canEat = food.radius < player.radius * 0.96;
    const isCaught = distance(food.position, player.position) < player.radius + food.radius * 0.72;

    if (canEat && isCaught) {
      eaten += 1;
      growth += Math.max(1.2, food.radius * 0.08);
      continue;
    }

    if (!canEat && isCaught) {
      hitPredator = true;
    }

    remainingFoods.push(food);
  }

  const grownPlayer: PlayerFish = {
    ...player,
    radius: Math.min(WIN_RADIUS, player.radius + growth),
    score: player.score + eaten * 10 + Math.round(growth * 3),
    eaten: player.eaten + eaten
  };

  const replenishedFoods = [...remainingFoods];

  while (replenishedFoods.length < FOOD_COUNT) {
    replenishedFoods.push(createFoodFish(`food-${crypto.randomUUID()}`, grownPlayer.radius));
  }

  return {
    ...state,
    player: grownPlayer,
    foods: replenishedFoods,
    status: hitPredator ? "gameOver" : grownPlayer.radius >= WIN_RADIUS ? "won" : "playing"
  };
}

function moveFood(food: Fish, deltaSeconds: number): Fish {
  const nextPosition = {
    x: food.position.x + food.direction.x * food.speed * deltaSeconds,
    y: food.position.y + food.direction.y * food.speed * deltaSeconds
  };

  let nextDirection = food.direction;

  if (nextPosition.x < food.radius || nextPosition.x > SEA_WIDTH - food.radius) {
    nextDirection = { ...nextDirection, x: -nextDirection.x };
  }

  if (nextPosition.y < food.radius || nextPosition.y > SEA_HEIGHT - food.radius) {
    nextDirection = { ...nextDirection, y: -nextDirection.y };
  }

  return {
    ...food,
    position: {
      x: clamp(nextPosition.x, food.radius, SEA_WIDTH - food.radius),
      y: clamp(nextPosition.y, food.radius, SEA_HEIGHT - food.radius)
    },
    direction: nextDirection
  };
}
