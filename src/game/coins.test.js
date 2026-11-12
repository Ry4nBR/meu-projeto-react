import {
  advanceCoinDrops,
  applyEnemyDamage,
  COIN_LIFETIME,
  collectCoinDrops,
  createCoinDrop,
  CoinEntity,
  MAGNET_RADIUS,
  MAGNET_SPEED,
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

test('collects coins when a party member overlaps them', () => {
  const coins = [
    { id: 'coin-1', x: 10, y: 10, value: 3, timeRemaining: 5 },
    { id: 'coin-2', x: 100, y: 100, value: 2, timeRemaining: 5 },
  ];
  const result = collectCoinDrops(
    coins,
    {
      leader: { x: 0, y: 10, radius: 12 },
      followers: [],
    },
    0.1,
  );

  expect(result.collected).toHaveLength(1);
  expect(result.collected[0].id).toBe('coin-1');
  expect(result.remaining[0].id).toBe('coin-2');
  expect(result.remaining[0].timeRemaining).toBeCloseTo(4.9);
});

test('magnetically attracts coins towards the leader when within magnet radius', () => {
  const coins = [
    { id: 'coin-magnet', x: 50, y: 0, value: 5, timeRemaining: 8 },
  ];
  const party = {
    leader: { x: 0, y: 0, radius: 12 },
    followers: [],
  };
  const result = collectCoinDrops(coins, party, 0.1);

  expect(result.collected).toHaveLength(0);
  expect(result.remaining[0].x).toBeLessThan(50);
  expect(result.remaining[0].x).toBeCloseTo(50 - MAGNET_SPEED * 0.1);
});

test('CoinEntity is an alias for createCoinDrop', () => {
  const enemy = { id: 'enemy-1', x: 10, y: 20 };
  const coin = CoinEntity(enemy, () => 0.5);
  expect(coin.id).toBe('coin-enemy-1');
  expect(coin.x).toBe(10);
  expect(coin.y).toBe(20);
});
