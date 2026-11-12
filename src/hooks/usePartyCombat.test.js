import { act, render, screen } from '@testing-library/react';
import { applyContactDamage, usePartyCombat } from './usePartyCombat';

function CombatHarness({ party, enemies }) {
  const combat = usePartyCombat(party, enemies);
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
  const enemies = [{ x: 100, y: 100, atk: 10, radius: 10 }];
  const initialHealth = {
    leader: { hp: 100, maxHp: 100 },
    followers: { 'follower-0': { hp: 100, maxHp: 100 } },
  };

  expect(applyContactDamage(initialHealth, party, enemies)).toEqual({
    leader: { hp: 90, maxHp: 100 },
    followers: { 'follower-0': { hp: 100, maxHp: 100 } },
  });
});

test('deals contact damage on the half-second interval and exposes health for rendering', () => {
  render(
    <CombatHarness
      party={{ leader: { x: 100, y: 100 }, followers: [] }}
      enemies={[{ x: 100, y: 100, atk: 10, radius: 10 }]}
    />,
  );

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(500));

  const combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.party.leader.hp).toBe(90);
  expect(combat.party.leader.maxHp).toBe(100);
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
      enemies={[{ x: 200, y: 200, atk: 100, radius: 10 }]}
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
        { x: 200, y: 200, atk: 100, radius: 10 },
        { x: 100, y: 100, atk: 100, radius: 10 },
      ]}
    />,
  );

  act(() => scheduledFrame(1000));
  combat = JSON.parse(screen.getByLabelText('combat').textContent);
  expect(combat.isGameOver).toBe(true);
});
