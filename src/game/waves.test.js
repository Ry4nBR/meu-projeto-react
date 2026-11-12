import {
  createWaveEnemies,
  ENEMIES_PER_WAVE_INCREMENT,
  getWaveConfig,
  INITIAL_WAVE_ENEMY_COUNT,
} from './waves';

test('starts with five enemies and adds three enemies per wave', () => {
  expect(getWaveConfig(1).count).toBe(INITIAL_WAVE_ENEMY_COUNT);
  expect(getWaveConfig(2).count).toBe(
    INITIAL_WAVE_ENEMY_COUNT + ENEMIES_PER_WAVE_INCREMENT,
  );
  expect(createWaveEnemies(1)).toHaveLength(5);
  expect(createWaveEnemies(2)).toHaveLength(8);
});

test('scales enemy health by ten percent with each wave', () => {
  expect(getWaveConfig(1).maxHp).toBe(50);
  expect(getWaveConfig(2).maxHp).toBe(55);
  expect(getWaveConfig(3).maxHp).toBe(61);
});

test('spawns wave enemies along the outer edges of the canvas', () => {
  const enemies = createWaveEnemies(1);
  expect(enemies.every((enemy) => enemy.x === 0 || enemy.x === 800 || enemy.y === 0 || enemy.y === 600)).toBe(true);
});
