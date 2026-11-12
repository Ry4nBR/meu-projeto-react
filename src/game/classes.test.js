import { createWarriorLeader, WARRIOR_CONFIG } from './classes';

test('creates the default Warrior leader with the required attributes', () => {
  expect(createWarriorLeader()).toEqual({
    id: 'leader',
    name: 'Guerreiro',
    classType: 'warrior',
    hp: 200,
    maxHp: 200,
    atk: WARRIOR_CONFIG.atk,
    range: WARRIOR_CONFIG.range,
    cooldown: 1,
  });
  expect(WARRIOR_CONFIG.damageReduction).toBe(0.2);
});
