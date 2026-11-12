import { drawParty } from './renderParty';

function createContext() {
  return {
    arc: jest.fn(),
    beginPath: jest.fn(),
    clearRect: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
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

test('draws an ice projectile on the canvas', () => {
  const context = createContext();
  const party = {
    leader: { x: 100, y: 120 },
    followers: [],
    direction: { x: 1, y: 0 },
  };

  drawParty(context, party, 800, 600, [], [{ x: 40, y: 50 }]);

  expect(context.arc).toHaveBeenNthCalledWith(
    2,
    40,
    50,
    5,
    0,
    Math.PI * 2,
  );
  expect(context.fillStyle).toBe('#9be7ff');
});

test('draws a temporary green healing aura', () => {
  const context = createContext();
  const party = {
    leader: { x: 100, y: 120 },
    followers: [],
    direction: { x: 1, y: 0 },
  };

  drawParty(context, party, 800, 600, [], [], [
    { x: 40, y: 50, timeRemaining: 0.3 },
  ]);

  expect(context.arc).toHaveBeenNthCalledWith(
    2,
    40,
    50,
    20,
    0,
    Math.PI * 2,
  );
  expect(context.strokeStyle).toBe('#38ef7d');
  expect(context.globalAlpha).toBe(1);
});

test('draws an expanding Wind Mage shockwave', () => {
  const context = createContext();
  const party = {
    leader: { x: 100, y: 120 },
    followers: [],
    direction: { x: 1, y: 0 },
  };

  drawParty(context, party, 800, 600, [], [], [], [
    { x: 40, y: 50, radius: 48 },
  ]);

  expect(context.arc).toHaveBeenNthCalledWith(
    2,
    40,
    50,
    48,
    0,
    Math.PI * 2,
  );
  expect(context.strokeStyle).toBe('#b7f7ff');
  expect(context.globalAlpha).toBe(1);
});

test('renders autonomous skeleton minions with their own health bar', () => {
  const context = createContext();
  const party = {
    leader: { x: 100, y: 120 },
    followers: [],
    direction: { x: 1, y: 0 },
  };

  drawParty(context, party, 800, 600, [], [], [], [], [
    { id: 'skeleton-1', x: 40, y: 50, hp: 30, maxHp: 60, radius: 7 },
  ]);

  expect(context.arc).toHaveBeenNthCalledWith(
    2,
    40,
    50,
    7,
    0,
    Math.PI * 2,
  );
  expect(context.fillRect).toHaveBeenCalledTimes(2);
});

test('draws gold coins with a glow and fading alpha', () => {
  const context = createContext();
  const party = {
    leader: { x: 100, y: 120 },
    followers: [],
    direction: { x: 1, y: 0 },
  };

  drawParty(context, party, 800, 600, [], [], [], [], [], [
    { x: 40, y: 50, timeRemaining: 5, value: 3 },
  ]);

  expect(context.arc).toHaveBeenNthCalledWith(
    2,
    40,
    50,
    6,
    0,
    Math.PI * 2,
  );
  expect(context.fillStyle).toBe('#ffd700');
  expect(context.shadowBlur).toBe(0);
  expect(context.globalAlpha).toBe(1);
});

test('draws the pickup animation around a collected coin', () => {
  const context = createContext();
  const party = {
    leader: { x: 100, y: 120 },
    followers: [],
    direction: { x: 1, y: 0 },
  };

  drawParty(context, party, 800, 600, [], [], [], [], [], [], [
    { x: 40, y: 50, timeRemaining: 0.2 },
  ]);

  expect(context.arc).toHaveBeenNthCalledWith(
    2,
    40,
    50,
    14,
    0,
    Math.PI * 2,
  );
  expect(context.strokeStyle).toBe('#fff2a8');
});
