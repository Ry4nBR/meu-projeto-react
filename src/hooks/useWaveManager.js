import { useRef, useState } from 'react';
import { createWaveEnemies, WAVE_DURATION } from '../game/waves';
import { useGameLoop } from './useGameLoop';

export function useWaveManager(spawnEnemies, active = true) {
  const [wave, setWave] = useState(1);
  const [countdown, setCountdown] = useState(WAVE_DURATION);
  const elapsedRef = useRef(0);
  const waveRef = useRef(1);
  const spawnEnemiesRef = useRef(spawnEnemies);
  spawnEnemiesRef.current = spawnEnemies;

  useGameLoop((deltaTime) => {
    if (deltaTime <= 0) {
      return;
    }

    elapsedRef.current += deltaTime;
    if (elapsedRef.current >= WAVE_DURATION) {
      elapsedRef.current %= WAVE_DURATION;
      waveRef.current += 1;
      setWave(waveRef.current);
      spawnEnemiesRef.current(createWaveEnemies(waveRef.current));
    }
    setCountdown(Math.ceil(WAVE_DURATION - elapsedRef.current));
  }, active);

  return { wave, countdown };
}
