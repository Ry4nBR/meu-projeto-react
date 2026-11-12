import { act, render, screen } from '@testing-library/react';
import {
  applyContactDamage,
  applyIceProjectileDamage,
  applyWarriorAttack,
  applyWindShockwaveDamage,
  usePartyCombat,
} from './usePartyCombat';
import {
  advanceIceProjectile,
  createIceProjectile,
  createIceWitch,
  ICE_WITCH_CONFIG,
} from '../game/iceWitch';
import { DRUID_CONFIG } from '../game/druid';
import { WIND_MAGE_CONFIG } from '../game/windMage';
import { NECROMANCER_CONFIG, SKELETON_CONFIG } from '../game/necromancer';

function CombatHarness({ party, enemies, applySlow, applyKnockback }) {
  const combat = usePartyCombat(
    party,
    enemies,
    true,
    applySlow,
    applyKnockback,
  );
  return <output aria-label="combat">{JSON.stringify(combat)}</output>;
}

let scheduledFrame;

beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    scheduledFrame = callback;
    return 1;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('applies enemy contact damage to the colliding member', () => {
  const party = {
    leader: { x: 100, y: 100 },
    followers: [{ id: 'follower-0', x: 200, y: 200 }],
  };
  const enemies = [
    { id: 'enemy-1', x: 100, y: 100, atk: 10, radius: 10 },
  ];
  const initialHealth = {
    leader: { hp: 100, maxHp: 100 },
    followers: { 'follower-0': { hp: 100, maxHp: 100 } },
  };

  expect(applyContactDamage(initialHealth, party, enemies)).toEqual({
    leader: { hp: 92, maxHp: 100 },
    followers: { 'follower-0': { hp: 100, maxHp: 100 } },
    enemies: {},
    skeletons: {},
  });
});

test('deals contact damage on the half-second interval and exposes health for rendering', () => {
  render(
    <CombatHarness
      party={{ leader: { x: 100, y: 100 }, followers: [] }}
      enemies={[
        {
          id: 'enemy-1',
          x: 100,
          y: 100,
          atk: 10,
          radius: 10,
          hp: 50,
          maxHp: 50,
        },
      ]}
    />,
  );

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(500));

  const combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.party.leader.hp).toBe(192);
  expect(combat.party.leader.maxHp).toBe(200);
  expect(combat.party.leader.classType).toBe('warrior');
  expect(combat.enemies[0].radius).toBe(10);
});

test('removes a defeated follower and marks the game over when the leader dies', () => {
  const party = {
    leader: { x: 100, y: 100 },
    followers: [{ id: 'follower-0', x: 200, y: 200 }],
  };
  const { rerender } = render(
    <CombatHarness
      party={party}
      enemies={[{ id: 'enemy-1', x: 200, y: 200, atk: 125, radius: 10 }]}
    />,
  );

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(500));

  let combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.party.followers).toHaveLength(0);
  expect(combat.isGameOver).toBe(false);

  rerender(
    <CombatHarness
      party={party}
      enemies={[
        { id: 'enemy-1', x: 200, y: 200, atk: 125, radius: 10 },
        { id: 'enemy-2', x: 100, y: 100, atk: 250, radius: 10 },
      ]}
    />,
  );

  act(() => scheduledFrame(1000));
  combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.isGameOver).toBe(true);
});

test('Warrior attacks enemies within melee range every second', () => {
  const health = {
    leader: { hp: 200, maxHp: 200 },
    followers: {},
    enemies: {},
  };
  const leader = { x: 100, y: 100 };
  const enemies = [
    { id: 'near', x: 150, y: 100, hp: 50, maxHp: 50 },
    { id: 'far', x: 151, y: 100, hp: 50, maxHp: 50 },
  ];

  expect(applyWarriorAttack(health, leader, enemies)).toEqual({
    ...health,
    enemies: { near: { hp: 30, maxHp: 50 } },
  });
});

test('creates an Ice Witch that targets and damages the nearest enemy with a slowing projectile', () => {
  expect(createIceWitch().classType).toBe('ice-witch');
  const source = { x: 100, y: 100 };
  const enemies = [
    { id: 'far', x: 200, y: 100, hp: 50, maxHp: 50 },
    { id: 'near', x: 130, y: 100, hp: 50, maxHp: 50 },
  ];
  const projectile = createIceProjectile(source, enemies);

  expect(projectile.targetId).toBe('near');
  const result = advanceIceProjectile(projectile, enemies, 0.25);
  expect(result.hit).toEqual({ enemyId: 'near' });
  expect(result.projectile).toBeNull();

  const health = {
    leader: { hp: 200, maxHp: 200 },
    followers: {},
    enemies: {},
  };
  expect(applyIceProjectileDamage(health, enemies[1]).enemies.near.hp).toBe(
    50 - ICE_WITCH_CONFIG.atk,
  );
});

test('fires the Ice Witch ability every 1.5 seconds and applies the slow on impact', () => {
  const applySlow = jest.fn();
  render(
    <CombatHarness
      party={{
        leader: { x: 400, y: 300 },
        followers: [{ id: 'follower-0', x: 100, y: 100 }],
      }}
      enemies={[
        {
          id: 'enemy-1',
          x: 130,
          y: 100,
          hp: 50,
          maxHp: 50,
          atk: 0,
          radius: 10,
        },
      ]}
      applySlow={applySlow}
    />,
  );

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(1500));

  const combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(applySlow).toHaveBeenCalledWith('enemy-1', 3);
  expect(combat.enemies[0].hp).toBe(45);
  expect(combat.projectiles).toHaveLength(0);
});

test('Druid heals the lowest-health ally every two seconds and emits a green aura', () => {
  render(
    <CombatHarness
      party={{
        leader: { x: 100, y: 100 },
        followers: [
          { id: 'follower-0', x: 120, y: 100 },
          { id: 'follower-1', x: 300, y: 300 },
        ],
      }}
      enemies={[
        {
          id: 'enemy-druid-test',
          x: 100,
          y: 100,
          hp: 500,
          maxHp: 500,
          atk: 10,
          radius: 10,
        },
      ]}
    />,
  );

  act(() => scheduledFrame(0));
  for (let frame = 1; frame <= 4; frame += 1) {
    act(() => scheduledFrame(frame * 500));
  }

  const combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.party.leader.hp).toBe(193);
  expect(combat.party.followers[1].classType).toBe('druid');
  expect(combat.healingEffects).toEqual([
    expect.objectContaining({
      x: 100,
      y: 100,
      timeRemaining: DRUID_CONFIG.auraDuration,
    }),
  ]);
});

test('Wind Mage damages enemies caught by its shockwave and applies a 60-pixel knockback', () => {
  const applyKnockback = jest.fn();
  render(
    <CombatHarness
      party={{
        leader: { x: 400, y: 300 },
        followers: [
          { id: 'follower-0', x: 200, y: 200 },
          { id: 'follower-1', x: 300, y: 300 },
          { id: 'follower-2', x: 100, y: 100 },
        ],
      }}
      enemies={[
        {
          id: 'wind-target',
          x: 150,
          y: 100,
          hp: 100,
          maxHp: 100,
          atk: 0,
          radius: 10,
        },
      ]}
      applyKnockback={applyKnockback}
    />,
  );

  act(() => scheduledFrame(0));
  for (let frame = 1; frame <= 6; frame += 1) {
    act(() => scheduledFrame(frame * 500));
  }

  const combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.party.followers[2].classType).toBe('wind-mage');
  expect(combat.enemies[0].hp).toBe(
    100 - 2 * ICE_WITCH_CONFIG.atk - WIND_MAGE_CONFIG.atk,
  );
  expect(applyKnockback).toHaveBeenCalledTimes(1);
  expect(applyKnockback).toHaveBeenCalledWith(
    'wind-target',
    { x: 100, y: 100 },
  );

  const health = {
    leader: { hp: 200, maxHp: 200 },
    followers: {},
    enemies: {},
  };
  expect(
    applyWindShockwaveDamage(health, {
      id: 'wind-target',
      hp: 100,
      maxHp: 100,
    }).enemies['wind-target'].hp,
  ).toBe(100 - WIND_MAGE_CONFIG.atk);
});

test('Necromancer summons uncapped skeletons every fifteen seconds', () => {
  render(
    <CombatHarness
      party={{
        leader: { x: 400, y: 300 },
        followers: [
          { id: 'follower-0', x: 360, y: 300 },
          { id: 'follower-1', x: 320, y: 300 },
          { id: 'follower-2', x: 280, y: 300 },
          { id: 'follower-3', x: 240, y: 300 },
        ],
      }}
      enemies={[
        {
          id: 'summon-test',
          x: 700,
          y: 500,
          hp: 5000,
          maxHp: 5000,
          atk: 0,
          radius: 10,
        },
      ]}
    />,
  );

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(15000));

  let combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.party.followers[3].classType).toBe('necromancer');
  expect(combat.skeletons).toHaveLength(1);
  expect(combat.skeletons[0]).toMatchObject({
    hp: SKELETON_CONFIG.hp,
    maxHp: SKELETON_CONFIG.hp,
  });

  act(() => scheduledFrame(30000));
  combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.skeletons).toHaveLength(2);
  expect(NECROMANCER_CONFIG.cooldown).toBe(15);
});

test('enemy contact can defeat an individual skeleton', () => {
  const health = {
    leader: { hp: 200, maxHp: 200 },
    followers: {},
    enemies: {},
    skeletons: {
      'skeleton-1': { hp: 5, maxHp: 60 },
    },
  };
  const party = {
    leader: { x: 300, y: 300 },
    followers: [],
    skeletons: [
      { id: 'skeleton-1', x: 100, y: 100, hp: 5, maxHp: 60 },
    ],
  };
  const result = applyContactDamage(
    health,
    party,
    [{ id: 'enemy', x: 100, y: 100, atk: 10, radius: 10 }],
  );

  expect(result.skeletons['skeleton-1'].hp).toBe(0);
});

test('an ability kill produces a coin drop at the enemy position', () => {
  const health = {
    leader: { hp: 200, maxHp: 200 },
    followers: {},
    enemies: {},
    coinDrops: [],
  };
  const result = applyIceProjectileDamage(health, {
    id: 'enemy-coin-test',
    x: 25,
    y: 40,
    hp: 5,
    maxHp: 5,
  });

  expect(result.coinDrops).toHaveLength(1);
  expect(result.coinDrops[0]).toMatchObject({
    x: 25,
    y: 40,
    value: expect.any(Number),
    timeRemaining: 10,
  });
  expect(result.coinDrops[0].value).toBeGreaterThanOrEqual(1);
  expect(result.coinDrops[0].value).toBeLessThanOrEqual(5);
});
