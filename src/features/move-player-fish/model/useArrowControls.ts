import { useEffect, useRef } from "react";

import { normalize, type Vector } from "@entities/fish";

const keyVectors: Record<string, Vector> = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
};

const codeToKey: Record<string, string> = {
  ArrowUp: "ArrowUp",
  KeyW: "w",
  ArrowDown: "ArrowDown",
  KeyS: "s",
  ArrowLeft: "ArrowLeft",
  KeyA: "a",
  ArrowRight: "ArrowRight",
  KeyD: "d",
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
            y: next.y + vector.y,
          };
        }
      });

      movement.current = normalize(next);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = getControlKey(event);

      if (!(key in keyVectors)) {
        return;
      }

      event.preventDefault();
      pressedKeys.current.add(key);
      updateMovement();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = getControlKey(event);

      if (!(key in keyVectors)) {
        return;
      }

      pressedKeys.current.delete(key);
      updateMovement();
    };

    const handleBlur = () => {
      pressedKeys.current.clear();
      updateMovement();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return movement;
}

function normalizeKey(key: string) {
  return key.length === 1 ? key.toLowerCase() : key;
}

function getControlKey(event: KeyboardEvent) {
  return codeToKey[event.code] ?? normalizeKey(event.key);
}
