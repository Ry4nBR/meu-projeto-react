import { useEffect, useRef, useState } from 'react';

const INITIAL_DIRECTION = { x: 1, y: 0 };

const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

export function usePlayerDirection(active = true) {
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const directionRef = useRef(direction);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      const nextDirection = KEY_DIRECTIONS[event.key] || KEY_DIRECTIONS[event.key.toLowerCase()];

      if (!nextDirection) {
        return;
      }

      event.preventDefault();

      const currentDirection = directionRef.current;
      const isOpposite =
        currentDirection.x * nextDirection.x +
          currentDirection.y * nextDirection.y ===
        -1;

      if (isOpposite) {
        return;
      }

      directionRef.current = nextDirection;
      setDirection(nextDirection);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return direction;
}
