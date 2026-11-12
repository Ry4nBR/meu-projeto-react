import { createEnemy } from './entities';

export const WAVE_DURATION = 30;
export const INITIAL_WAVE_ENEMY_COUNT = 5;
export const ENEMIES_PER_WAVE_INCREMENT = 3;
export const ENEMY_HP_PER_WAVE_MULTIPLIER = 1.1;

export function getWaveConfig(wave) {
  return {
    count:
      INITIAL_WAVE_ENEMY_COUNT +
      (wave - 1) * ENEMIES_PER_WAVE_INCREMENT,
    maxHp: Math.round(50 * ENEMY_HP_PER_WAVE_MULTIPLIER ** (wave - 1)),
  };
}

export function createWaveEnemies(wave) {
  const { count, maxHp } = getWaveConfig(wave);
  const edges = [
    (index) => ({ x: 0, y: (index * 97) % 600 }),
    (index) => ({ x: 800, y: (index * 131) % 600 }),
    (index) => ({ x: (index * 173) % 800, y: 0 }),
    (index) => ({ x: (index * 211) % 800, y: 600 }),
  ];

  return Array.from({ length: count }, (_, index) =>
    createEnemy({
      id: `wave-${wave}-enemy-${index + 1}`,
      ...edges[index % edges.length](index),
      hp: maxHp,
      maxHp,
      atk: 8,
      speed: 45,
    }),
  );
}
