import { useEffect, useRef } from 'react';

const FRAME_DURATION = 1000 / 60;

export function useGameLoop(onFrame) {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    let animationFrameId;
    let lastFrameTimestamp = null;

    const loop = (timestamp) => {
      if (lastFrameTimestamp === null) {
        lastFrameTimestamp = timestamp;
        onFrameRef.current(0);
      } else {
        const elapsed = timestamp - lastFrameTimestamp;

        if (elapsed >= FRAME_DURATION) {
          lastFrameTimestamp = timestamp - (elapsed % FRAME_DURATION);
          onFrameRef.current(elapsed / 1000);
        }
      }

      animationFrameId = window.requestAnimationFrame(loop);
    };

    animationFrameId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);
}
