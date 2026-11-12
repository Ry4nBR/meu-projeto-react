import {
  advanceSkeletons,
  createNecromancer,
  createSkeleton,
  NECROMANCER_CONFIG,
  SKELETON_CONFIG,
} from './necromancer';

test('creates a Necromancer follower with a fifteen-second summoning cooldown', () => {
  expect(createNecromancer()).toMatchObject({
    id: 'follower-3',
    name: 'Necromante',
    classType: 'necromancer',
    cooldown: 15,
  });
  expect(NECROMANCER_CONFIG.cooldown).toBe(15);
});

test('skeletons pursue the nearest enemy and attack when in range', () => {
  const skeleton = createSkeleton('skeleton-1', { x: 0, y: 0 });
  const enemies = [
    { id: 'far', x: 100, y: 0, hp: 100 },
    { id: 'near', x: 0, y: 30, hp: 100 },
  ];

  const firstStep = advanceSkeletons([skeleton], enemies, 0.5);
  expect(firstStep.skeletons[0].y).toBe(30);
  expect(firstStep.hits).toHaveLength(0);

  const attack = advanceSkeletons(
    firstStep.skeletons,
    enemies,
    SKELETON_CONFIG.attackCooldown,
  );
  expect(attack.hits).toEqual([
    { skeletonId: 'skeleton-1', enemyId: 'near' },
  ]);
});

test('skeleton attacks use their own damage value', () => {
  expect(SKELETON_CONFIG.atk).toBe(10);
  expect(createSkeleton('skeleton-1', { x: 1, y: 2 })).toMatchObject({
    hp: 60,
    maxHp: 60,
    atk: 10,
  });
});
