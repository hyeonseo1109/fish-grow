export type Vector = {
  x: number;
  y: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function distance(a: Vector, b: Vector) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
