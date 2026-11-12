export const COIN_LIFETIME = 10;
export const COIN_RADIUS = 6;
export const PICKUP_EFFECT_DURATION = 0.35;

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

export function collectCoinDrops(coins, party, deltaTime = 0) {
  const members = [party.leader, ...party.followers];
  const remaining = [];
  const collected = [];
  const activeCoins = advanceCoinDrops(coins, deltaTime);

  activeCoins.forEach((coin) => {
    const collector = members.find(
      (member) =>
        Math.hypot(member.x - coin.x, member.y - coin.y) <=
        (member.radius || 12) + COIN_RADIUS,
    );

    if (collector) {
      collected.push(coin);
    } else {
      remaining.push(coin);
    }
  });

  return { remaining, collected };
}
