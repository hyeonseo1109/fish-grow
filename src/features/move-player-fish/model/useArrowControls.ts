import { useEffect, useRef } from "react";

import { normalize, type Vector } from "@entities/fish";

const keyVectors: Record<string, Vector> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};

export function useArrowControls() {
  const pressedKeys = useRef(new Set<string>());
  const movement = useRef<Vector>({ x: 0, y: 0 });

  useEffect(() => {
    const updateMovement = () => {
      let next = { x: 0, y: 0 };

      pressedKeys.current.forEach((key) => {
        const vector = keyVectors[key];

        if (vector) {
          next = {
            x: next.x + vector.x,
            y: next.y + vector.y
          };
        }
      });

      movement.current = normalize(next);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.key in keyVectors)) {
        return;
      }

      event.preventDefault();
      pressedKeys.current.add(event.key);
      updateMovement();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!(event.key in keyVectors)) {
        return;
      }

      pressedKeys.current.delete(event.key);
      updateMovement();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return movement;
}
