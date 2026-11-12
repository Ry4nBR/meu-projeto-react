import {
  advanceWindShockwave,
  createWindMage,
  createWindShockwave,
  getWindKnockbackPosition,
  WIND_MAGE_CONFIG,
} from './windMage';

test('creates the Wind Mage with a three-second shockwave cooldown', () => {
  expect(createWindMage()).toMatchObject({
    id: 'follower-2',
    name: 'Mago de Vento',
    classType: 'wind-mage',
    cooldown: 3,
  });
});

test('expands a shockwave and hits enemies once as the wave reaches them', () => {
  const wave = createWindShockwave({ x: 10, y: 10 }, 'wave-1');
  const enemies = [
    { id: 'near', x: 30, y: 10 },
    { id: 'far', x: 100, y: 10 },
  ];

  const firstStep = advanceWindShockwave(wave, enemies, 0.1);
  expect(firstStep.shockwave.radius).toBeCloseTo(24);
  expect(firstStep.hits).toEqual([
    { enemyId: 'near', origin: { x: 10, y: 10 } },
  ]);

  const secondStep = advanceWindShockwave(
    firstStep.shockwave,
    enemies,
    WIND_MAGE_CONFIG.expansionDuration,
  );
  expect(secondStep.hits).toEqual([
    { enemyId: 'far', origin: { x: 10, y: 10 } },
  ]);
  expect(secondStep.shockwave).toBeNull();
});

test('knocks an enemy away from the shockwave origin by 60 pixels', () => {
  expect(
    getWindKnockbackPosition(
      { x: 20, y: 30 },
      { x: 20, y: 10 },
    ),
  ).toEqual({ x: 20, y: 90 });
});
