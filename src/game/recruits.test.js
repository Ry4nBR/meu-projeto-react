import {
  collectRecruit,
  createGoldenPaladin,
  createRareBonusHero,
  createRecruit,
  RARE_HERO_BONUS_MULTIPLIER,
  RECRUIT_CLASSES,
  shouldSpawnRareRecruit,
} from './recruits';

test('creates a recruit with a random class and a free position inside the map', () => {
  const recruit = createRecruit('recruit-1', () => 0.5);

  expect(recruit).toMatchObject({
    id: 'recruit-1',
    classType: RECRUIT_CLASSES[2].classType,
    name: RECRUIT_CLASSES[2].name,
    hp: 100,
    maxHp: 100,
  });
  expect(recruit.x).toBeGreaterThanOrEqual(40);
  expect(recruit.x).toBeLessThanOrEqual(760);
  expect(recruit.y).toBeGreaterThanOrEqual(40);
  expect(recruit.y).toBeLessThanOrEqual(560);
});

test('creates a rare golden paladin with triple health and a damage aura', () => {
  expect(createGoldenPaladin('golden-1', () => 0.5)).toMatchObject({
    id: 'golden-1',
    classType: 'golden-paladin',
    name: 'Paladino Dourado',
    color: '#ffd700',
    hp: 300,
    maxHp: 300,
    auraRange: expect.any(Number),
    auraDamage: expect.any(Number),
    isRare: true,
  });
});

test('provides +30% bonus attributes on rare bonus heroes', () => {
  expect(RARE_HERO_BONUS_MULTIPLIER).toBe(1.3);

  const paladin = createGoldenPaladin('paladin-test', () => 0.5);
  expect(paladin.bonusMultiplier).toBe(1.3);
  expect(paladin.bonusHp).toBe(0.3);
  expect(paladin.bonusDamage).toBe(0.3);

  const rareHero = createRareBonusHero('rare-1', () => 0.5);
  expect(rareHero.isRare).toBe(true);
  expect(rareHero.hp).toBe(130);
  expect(rareHero.maxHp).toBe(130);
  expect(rareHero.bonusMultiplier).toBe(1.3);
});

test('rolls a rare recruit at a 15 percent chance per wave', () => {
  expect(shouldSpawnRareRecruit(() => 0.149)).toBe(true);
  expect(shouldSpawnRareRecruit(() => 0.15)).toBe(false);
});

test('recruits a touched hero when a slot is available', () => {
  const recruit = {
    id: 'recruit-1',
    x: 15,
    y: 10,
    radius: 5,
    classType: 'druid',
  };
  const result = collectRecruit(
    [recruit],
    { leader: { x: 0, y: 10, radius: 12 }, followers: [] },
    7,
  );

  expect(result.recruited).toBe(recruit);
  expect(result.recruits).toEqual([]);
});

test('keeps recruits on the map when the party is full or has no contact', () => {
  const recruit = { id: 'recruit-1', x: 100, y: 100, radius: 5 };
  const party = {
    leader: { x: 0, y: 0, radius: 12 },
    followers: [],
  };

  expect(collectRecruit([recruit], party, 1).recruited).toBeNull();
  expect(collectRecruit([recruit], party, 7).recruits).toEqual([recruit]);
});
