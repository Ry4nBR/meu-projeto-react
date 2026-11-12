import { act, fireEvent, render, screen } from '@testing-library/react';
import { usePartyMovement } from './usePartyMovement';
import { usePlayerDirection } from './usePlayerDirection';

function PartyHarness() {
  const direction = usePlayerDirection();
  const party = usePartyMovement(direction);

  return (
    <output aria-label="party">
      {JSON.stringify(party)}
    </output>
  );
}

let scheduledFrame;
let nextFrameId;

beforeEach(() => {
  nextFrameId = 0;
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    scheduledFrame = callback;
    nextFrameId += 1;
    return nextFrameId;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

function stepFrame(timestamp) {
  const frame = scheduledFrame;
  act(() => frame(timestamp));
}

test('moves the leader at constant speed and follows its position history at fixed spacing', () => {
  render(<PartyHarness />);
  stepFrame(0);
  stepFrame(1000);

  const party = JSON.parse(screen.getByLabelText('party').textContent);

  expect(party.leader.x).toBeCloseTo(520, 3);
  expect(party.leader.y).toBeCloseTo(300, 3);
  expect(party.followers).toHaveLength(3);
  expect(party.followers[0].x).toBeCloseTo(480, 3);
  expect(party.followers[1].x).toBeCloseTo(440, 3);
  expect(party.followers[2].x).toBeCloseTo(400, 3);
  expect(party.followers.every((follower) => follower.y === 300)).toBe(true);
});

test('records turns in the position history for followers to trace', () => {
  render(<PartyHarness />);
  stepFrame(0);
  stepFrame(1000);
  fireEvent.keyDown(window, { key: 'ArrowDown' });
  stepFrame(2000);

  const party = JSON.parse(screen.getByLabelText('party').textContent);

  expect(party.direction).toEqual({ x: 0, y: 1 });
  expect(party.leader.x).toBeCloseTo(520, 3);
  expect(party.leader.y).toBeCloseTo(420, 3);
  expect(
    party.positionHistory.some(
      (position) => position.x === 520 && position.y === 300,
    ),
  ).toBe(true);
});
