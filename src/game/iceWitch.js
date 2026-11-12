import { createCharacter } from './entities';

export const ICE_WITCH_CONFIG = {
  hp: 100,
  atk: 5,
  cooldown: 1.5,
  projectileSpeed: 240,
  slowFactor: 0.0,
  slowDuration: 2.5,
};

export function createIceWitch() {
  return createCharacter({
    id: 'follower-0',
    name: 'Bruxa de Gelo',
    classType: 'ice-witch',
    hp: ICE_WITCH_CONFIG.hp,
    maxHp: ICE_WITCH_CONFIG.hp,
    atk: ICE_WITCH_CONFIG.atk,
    range: Infinity,
    cooldown: ICE_WITCH_CONFIG.cooldown,
  });
}

export function createIceProjectile(source, enemies) {
  const target = enemies.reduce((nearest, enemy) => {
    const distance = Math.hypot(enemy.x - source.x, enemy.y - source.y);
    return distance < nearest.distance ? { enemy, distance } : nearest;
  }, { enemy: null, distance: Infinity }).enemy;

  if (!target) {
    return null;
  }

  return {
    targetId: target.id,
    x: source.x,
    y: source.y,
  };
}

export function advanceIceProjectile(projectile, enemies, deltaTime) {
  const target = enemies.find((enemy) => enemy.id === projectile.targetId);
  if (!target) {
    return { projectile: null, hit: null };
  }

  const offsetX = target.x - projectile.x;
  const offsetY = target.y - projectile.y;
  const distance = Math.hypot(offsetX, offsetY);
  const travelDistance = ICE_WITCH_CONFIG.projectileSpeed * deltaTime;

  if (distance <= travelDistance || distance === 0) {
    return {
      projectile: null,
      hit: { enemyId: target.id },
    };
  }

  return {
    projectile: {
      ...projectile,
      x: projectile.x + (offsetX / distance) * travelDistance,
      y: projectile.y + (offsetY / distance) * travelDistance,
    },
    hit: null,
  };
}
