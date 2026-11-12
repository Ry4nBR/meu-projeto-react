export const COIN_LIFETIME = 10;

export function createCoinDrop(enemy, random = Math.random) {
  return {
    id: `coin-${enemy.id}`,
    x: enemy.x,
    y: enemy.y,
    value: Math.floor(random() * 5) + 1,
    timeRemaining: COIN_LIFETIME,
  };
}

export function applyEnemyDamage(health, enemy, damage, random = Math.random) {
  const enemyHealth = health.enemies[enemy.id] || {
    hp: enemy.hp,
    maxHp: enemy.maxHp,
  };
  if (enemyHealth.hp <= 0 || damage <= 0) {
    return health;
  }

  const hp = Math.max(0, enemyHealth.hp - damage);
  const coinDrops = health.coinDrops || [];
  const nextCoinDrops =
    hp === 0
      ? [...coinDrops, createCoinDrop(enemy, random)]
      : coinDrops;

  return {
    ...health,
    ...(hp === 0 ? { coinDrops: nextCoinDrops } : {}),
    enemies: {
      ...health.enemies,
      [enemy.id]: { ...enemyHealth, hp },
    },
  };
}

export function advanceCoinDrops(coins, deltaTime) {
  return coins
    .map((coin) => ({
      ...coin,
      timeRemaining: coin.timeRemaining - deltaTime,
    }))
    .filter((coin) => coin.timeRemaining > 0);
}
