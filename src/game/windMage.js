import { createCharacter } from './entities';

export const WIND_MAGE_CONFIG = {
  hp: 100,
  cooldown: 3.5,
  atk: 15,
  radius: 120,
  expansionDuration: 0.5,
  knockbackDistance: 60,
};

export function createWindMage() {
  return createCharacter({
    id: 'follower-2',
    name: 'Mago de Vento',
    classType: 'wind-mage',
    hp: WIND_MAGE_CONFIG.hp,
    maxHp: WIND_MAGE_CONFIG.hp,
    atk: WIND_MAGE_CONFIG.atk,
    range: WIND_MAGE_CONFIG.radius,
    cooldown: WIND_MAGE_CONFIG.cooldown,
  });
}

export function createWindShockwave(source, id) {
  return {
    id,
    x: source.x,
    y: source.y,
    radius: 0,
    hitEnemyIds: [],
  };
}

export function advanceWindShockwave(shockwave, enemies, deltaTime) {
  const previousRadius = shockwave.radius;
  const radius = Math.min(
    WIND_MAGE_CONFIG.radius,
    previousRadius +
      (WIND_MAGE_CONFIG.radius / WIND_MAGE_CONFIG.expansionDuration) *
        deltaTime,
  );
  const hitEnemyIds = [...shockwave.hitEnemyIds];
  const hits = [];

  enemies.forEach((enemy) => {
    const distance = Math.hypot(enemy.x - shockwave.x, enemy.y - shockwave.y);
    if (
      !hitEnemyIds.includes(enemy.id) &&
      distance <= radius &&
      (distance > previousRadius || previousRadius === 0)
    ) {
      hitEnemyIds.push(enemy.id);
      hits.push({
        enemyId: enemy.id,
        origin: { x: shockwave.x, y: shockwave.y },
      });
    }
  });

  return {
    shockwave:
      radius >= WIND_MAGE_CONFIG.radius
        ? null
        : { ...shockwave, radius, hitEnemyIds },
    hits,
  };
}

export function getWindKnockbackPosition(enemy, origin) {
  const offsetX = enemy.x - origin.x;
  const offsetY = enemy.y - origin.y;
  const distance = Math.hypot(offsetX, offsetY);

  if (distance === 0) {
    return {
      x: enemy.x,
      y: enemy.y - WIND_MAGE_CONFIG.knockbackDistance,
    };
  }

  return {
    x:
      enemy.x +
      (offsetX / distance) * WIND_MAGE_CONFIG.knockbackDistance,
    y:
      enemy.y +
      (offsetY / distance) * WIND_MAGE_CONFIG.knockbackDistance,
  };
}
