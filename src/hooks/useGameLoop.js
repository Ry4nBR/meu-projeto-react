import { useEffect, useRef } from 'react';

const FRAME_DURATION = 1000 / 60;

export function useGameLoop(onFrame, enabled = true) {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let animationFrameId;
    let lastFrameTimestamp = null;
    let isRunning = true;

    const loop = (timestamp) => {
      if (!isRunning) {
        return;
      }

      if (lastFrameTimestamp === null) {
        lastFrameTimestamp = timestamp;
        onFrameRef.current(0);
      } else {
        const elapsed = timestamp - lastFrameTimestamp;

        if (elapsed >= FRAME_DURATION) {
          lastFrameTimestamp = timestamp;
          onFrameRef.current(elapsed / 1000);
        }
      }

      animationFrameId = window.requestAnimationFrame(loop);
    };

    animationFrameId = window.requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);
}
