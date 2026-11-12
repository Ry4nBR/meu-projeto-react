import { drawParty } from './renderParty';

function createContext() {
  return {
    arc: jest.fn(),
    beginPath: jest.fn(),
    clearRect: jest.fn(),
    fill: jest.fn(),
    lineTo: jest.fn(),
    moveTo: jest.fn(),
    stroke: jest.fn(),
  };
}

test('draws followers in blue, the leader in gold, and a direction indicator', () => {
  const context = createContext();
  const party = {
    leader: { x: 100, y: 120 },
    followers: [{ x: 80, y: 120 }, { x: 60, y: 120 }],
    direction: { x: 0, y: -1 },
  };

  drawParty(context, party);

  expect(context.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  expect(context.arc).toHaveBeenNthCalledWith(
    1,
    80,
    120,
    9,
    0,
    Math.PI * 2,
  );
  expect(context.arc).toHaveBeenNthCalledWith(
    2,
    60,
    120,
    9,
    0,
    Math.PI * 2,
  );
  expect(context.arc).toHaveBeenNthCalledWith(
    3,
    100,
    120,
    12,
    0,
    Math.PI * 2,
  );
  expect(context.fillStyle).toBe('#ffd700');
  expect(context.strokeStyle).toBe('#ffd700');
  expect(context.moveTo).toHaveBeenCalledWith(100, 120);
  expect(context.lineTo).toHaveBeenCalledWith(100, 96);
  expect(context.stroke).toHaveBeenCalledTimes(1);
});
