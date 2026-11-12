import { createWarriorLeader, WARRIOR_CONFIG, isInMeleeArc } from './classes';

test('creates the default Warrior leader with the required attributes', () => {
  expect(createWarriorLeader()).toEqual({
    id: 'leader',
    name: 'Guerreiro',
    classType: 'warrior',
    hp: 250,
    maxHp: 250,
    atk: WARRIOR_CONFIG.atk,
    range: WARRIOR_CONFIG.range,
    cooldown: 0.8,
  });
  expect(WARRIOR_CONFIG.damageReduction).toBe(0.25);
});

test('detects enemies within frontal melee arc', () => {
  const leader = { x: 100, y: 100 };
  const direction = { x: 1, y: 0 };
  expect(isInMeleeArc(leader, direction, { x: 130, y: 100 })).toBe(true);
  expect(isInMeleeArc(leader, direction, { x: 70, y: 100 })).toBe(false);
  expect(isInMeleeArc(leader, direction, { x: 300, y: 100 })).toBe(false);
});
