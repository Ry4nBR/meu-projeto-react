import { createCharacter } from './entities';

export const NECROMANCER_CONFIG = {
  hp: 100,
  cooldown: 15,
};

export const SKELETON_CONFIG = {
  hp: 80,
  atk: 10,
  speed: 80,
  attackRange: 18,
  attackCooldown: 1,
  radius: 7,
};

export function createNecromancer() {
  return createCharacter({
    id: 'follower-3',
    name: 'Necromante',
    classType: 'necromancer',
    hp: NECROMANCER_CONFIG.hp,
    maxHp: NECROMANCER_CONFIG.hp,
    atk: 0,
    range: Infinity,
    cooldown: NECROMANCER_CONFIG.cooldown,
  });
}

export function createSkeleton(id, position) {
  return {
    id,
    x: position.x,
    y: position.y,
    hp: SKELETON_CONFIG.hp,
    maxHp: SKELETON_CONFIG.hp,
    atk: SKELETON_CONFIG.atk,
    speed: SKELETON_CONFIG.speed,
    radius: SKELETON_CONFIG.radius,
    attackTimer: 0,
  };
}

export const SkeletonMinion = createSkeleton;

export function advanceSkeletons(skeletons, enemies, deltaTime) {
  const hits = [];
  const nextSkeletons = skeletons.map((skeleton) => {
    const livingEnemies = enemies.filter((enemy) => enemy.hp > 0);
    if (livingEnemies.length === 0 || deltaTime <= 0) {
      return skeleton;
    }

    const target = livingEnemies.reduce((nearest, enemy) => {
      const distance = Math.hypot(enemy.x - skeleton.x, enemy.y - skeleton.y);
      return distance < nearest.distance ? { enemy, distance } : nearest;
    }, { enemy: null, distance: Infinity });

    if (!target.enemy) {
      return skeleton;
    }

    const attackTimer = Math.max(0, skeleton.attackTimer - deltaTime);
    if (target.distance <= SKELETON_CONFIG.attackRange) {
      if (attackTimer === 0) {
        hits.push({ skeletonId: skeleton.id, enemyId: target.enemy.id });
        return {
          ...skeleton,
          attackTimer: SKELETON_CONFIG.attackCooldown,
        };
      }

      return { ...skeleton, attackTimer };
    }

    const movement = Math.min(skeleton.speed * deltaTime, target.distance);
    return {
      ...skeleton,
      x: skeleton.x + ((target.enemy.x - skeleton.x) / target.distance) * movement,
      y: skeleton.y + ((target.enemy.y - skeleton.y) / target.distance) * movement,
      attackTimer,
    };
  });

  return { skeletons: nextSkeletons, hits };
}
