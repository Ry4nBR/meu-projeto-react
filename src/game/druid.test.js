import { createDruid, DRUID_CONFIG, healMostWounded } from './druid';

test('creates a Druid follower with a four-second healing cooldown', () => {
  expect(createDruid()).toMatchObject({
    id: 'follower-1',
    name: 'Druida',
    classType: 'druid',
    cooldown: 4,
  });
  expect(DRUID_CONFIG.healAmount).toBe(25);
});

test('heals the most wounded living ally by percentage, without exceeding max HP', () => {
  const health = {
    leader: { hp: 50, maxHp: 200 },
    followers: {
      druid: { hp: 75, maxHp: 100 },
      archer: { hp: 30, maxHp: 100 },
    },
  };
  const party = {
    leader: { x: 10, y: 10 },
    followers: [
      { id: 'druid', x: 20, y: 10 },
      { id: 'archer', x: 30, y: 10 },
    ],
  };

  const result = healMostWounded(health, party);
  expect(result.target).toMatchObject({ id: 'leader', hp: 75, maxHp: 200 });

  const capped = healMostWounded(
    { leader: { hp: 190, maxHp: 200 }, followers: {} },
    { leader: { x: 0, y: 0 }, followers: [] },
  );
  expect(capped.target.hp).toBe(200);
});

test('does not heal allies that are full or defeated', () => {
  const result = healMostWounded(
    {
      leader: { hp: 0, maxHp: 200 },
      followers: { hero: { hp: 100, maxHp: 100 } },
    },
    {
      leader: { x: 0, y: 0 },
      followers: [{ id: 'hero', x: 10, y: 0 }],
    },
  );

  expect(result.target).toBeNull();
});
