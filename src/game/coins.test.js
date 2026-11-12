import {
  advanceCoinDrops,
  applyEnemyDamage,
  COIN_LIFETIME,
  createCoinDrop,
} from './coins';

test('drops a coin at the enemy position with a random value from one to five', () => {
  const enemy = { id: 'enemy-1', x: 45, y: 80 };

  expect(createCoinDrop(enemy, () => 0)).toEqual({
    id: 'coin-enemy-1',
    x: 45,
    y: 80,
    value: 1,
    timeRemaining: COIN_LIFETIME,
  });
  expect(createCoinDrop(enemy, () => 0.999).value).toBe(5);
});

test('creates a single coin when damage defeats an enemy', () => {
  const health = { enemies: {}, coinDrops: [] };
  const enemy = { id: 'enemy-1', x: 45, y: 80, hp: 10, maxHp: 10 };
  const damaged = applyEnemyDamage(health, enemy, 10, () => 0.5);

  expect(damaged.enemies['enemy-1'].hp).toBe(0);
  expect(damaged.coinDrops).toHaveLength(1);
  expect(applyEnemyDamage(damaged, enemy, 10).coinDrops).toHaveLength(1);
});

test('removes coins after ten seconds', () => {
  const coins = [
    { id: 'coin-1', value: 2, timeRemaining: 10 },
    { id: 'coin-2', value: 4, timeRemaining: 1 },
  ];

  expect(advanceCoinDrops(coins, 1)).toEqual([
    { id: 'coin-1', value: 2, timeRemaining: 9 },
  ]);
  expect(advanceCoinDrops(coins, 10)).toEqual([]);
});
