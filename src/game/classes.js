import { createCharacter } from './entities';

export const WARRIOR_CONFIG = {
  hp: 200,
  damageReduction: 0.2,
  atk: 20,
  range: 50,
  cooldown: 1,
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
