import { createCharacter } from './entities';

export const WARRIOR_CONFIG = {
  hp: 250,
  damageReduction: 0.25,
  atk: 25,
  range: 55,
  cooldown: 0.8,
  arcAngle: Math.PI * 0.75,
};

export function createWarriorLeader() {
  return createCharacter({
    id: 'leader',
    name: 'Guerreiro',
    classType: 'warrior',
    hp: WARRIOR_CONFIG.hp,
    maxHp: WARRIOR_CONFIG.hp,
    atk: WARRIOR_CONFIG.atk,
    range: WARRIOR_CONFIG.range,
    cooldown: WARRIOR_CONFIG.cooldown,
  });
}

export function isInMeleeArc(leader, direction, enemy) {
  const dx = enemy.x - leader.x;
  const dy = enemy.y - leader.y;
  const dist = Math.hypot(dx, dy);
  if (dist > WARRIOR_CONFIG.range || dist === 0) {
    return false;
  }
  const dot = (dx * direction.x + dy * direction.y) / dist;
  return dot >= Math.cos(WARRIOR_CONFIG.arcAngle / 2);
}

export {
  createNecromancer,
  NECROMANCER_CONFIG,
  SKELETON_CONFIG,
  createSkeleton,
  SkeletonMinion,
  advanceSkeletons,
} from './necromancer';
