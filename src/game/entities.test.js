import { createCharacter, createEnemy } from './entities';

test('creates a character with the fields defined by the game model', () => {
  const character = createCharacter({
    id: 'hero-1',
    name: 'Archer',
    classType: 'ranged',
    hp: 80,
    maxHp: 100,
    atk: 15,
    range: 120,
    cooldown: 1.2,
  });

  expect(character).toEqual({
    id: 'hero-1',
    name: 'Archer',
    classType: 'ranged',
    hp: 80,
    maxHp: 100,
    atk: 15,
    range: 120,
    cooldown: 1.2,
  });
});

test('creates an enemy with the fields defined by the game model', () => {
  const enemy = createEnemy({
    id: 'enemy-1',
    x: 320,
    y: 240,
    hp: 50,
    maxHp: 50,
    atk: 8,
    speed: 40,
  });

  expect(enemy).toEqual({
    id: 'enemy-1',
    x: 320,
    y: 240,
    hp: 50,
    maxHp: 50,
    atk: 8,
    speed: 40,
  });
});
