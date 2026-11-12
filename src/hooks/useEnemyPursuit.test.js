import { act, render, screen } from '@testing-library/react';
import { advanceEnemies, useEnemyPursuit } from './useEnemyPursuit';

function EnemyHarness({ party }) {
  const enemies = useEnemyPursuit(party);
  return <output aria-label="enemies">{JSON.stringify(enemies)}</output>;
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

test('spawns three enemies on the canvas edges and pursues the nearest party member', () => {
  const party = {
    leader: { x: 400, y: 300 },
    followers: [{ x: 360, y: 300 }],
  };
  render(<EnemyHarness party={party} />);

  const initialEnemies = JSON.parse(screen.getByLabelText('enemies').textContent);
  expect(initialEnemies).toHaveLength(3);
  expect(initialEnemies.every((enemy) => enemy.speed === 45)).toBe(true);

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(1000));

  const movedEnemies = JSON.parse(screen.getByLabelText('enemies').textContent);
  const distanceToNearestMember = Math.hypot(360, 300);
  expect(movedEnemies[0].x).toBeCloseTo((360 / distanceToNearestMember) * 45, 3);
  expect(movedEnemies[0].y).toBeCloseTo((300 / distanceToNearestMember) * 45, 3);
});

test('moves enemies toward the nearest member at constant speed', () => {
  const enemies = [{ id: 'e', x: 0, y: 0, speed: 10 }];
  const party = {
    leader: { x: 100, y: 0 },
    followers: [{ x: 0, y: 20 }],
  };

  expect(advanceEnemies(enemies, party, 1)[0]).toEqual({
    ...enemies[0],
    x: 0,
    y: 10,
  });
});
