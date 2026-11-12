import { createCharacter } from './entities';

export const DRUID_CONFIG = {
  hp: 100,
  cooldown: 4,
  healAmount: 25,
  auraDuration: 0.6,
};

export function createDruid() {
  return createCharacter({
    id: 'follower-1',
    name: 'Druida',
    classType: 'druid',
    hp: DRUID_CONFIG.hp,
    maxHp: DRUID_CONFIG.hp,
    atk: 0,
    range: Infinity,
    cooldown: DRUID_CONFIG.cooldown,
  });
}

export function healMostWounded(health, party) {
  const targets = [
    { id: 'leader', ...party.leader, ...health.leader },
    ...party.followers.map((follower) => ({
      ...follower,
      ...health.followers[follower.id],
    })),
  ].filter(
    (target) =>
      target.hp > 0 &&
      target.maxHp > 0 &&
      target.hp < target.maxHp,
  );

  if (targets.length === 0) {
    return { health, target: null };
  }

  const target = targets.reduce((mostWounded, candidate) =>
    candidate.hp / candidate.maxHp <
    mostWounded.hp / mostWounded.maxHp
      ? candidate
      : mostWounded,
  );
  const healedTarget = {
    ...target,
    hp: Math.min(target.maxHp, target.hp + DRUID_CONFIG.healAmount),
  };

  if (target.id === 'leader') {
    return {
      health: { ...health, leader: healedTarget },
      target: healedTarget,
    };
  }

  return {
    health: {
      ...health,
      followers: {
        ...health.followers,
        [target.id]: healedTarget,
      },
    },
    target: healedTarget,
  };
}
