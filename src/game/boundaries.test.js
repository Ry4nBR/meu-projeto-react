import { hasCanvasBoundaryCollision, ARENA_PADDING } from './boundaries';

test.each([
  [{ x: ARENA_PADDING, y: 300 }],
  [{ x: 800 - ARENA_PADDING, y: 300 }],
  [{ x: 400, y: ARENA_PADDING }],
  [{ x: 400, y: 600 - ARENA_PADDING }],
  [{ x: 0, y: 300 }],
  [{ x: 800, y: 300 }],
  [{ x: -1, y: 300 }],
  [{ x: 801, y: 300 }],
])('detects a leader at or beyond arena padding boundary: %o', (position) => {
  expect(hasCanvasBoundaryCollision(position, 800, 600)).toBe(true);
});

test('allows positions strictly inside the arena padding', () => {
  expect(
    hasCanvasBoundaryCollision({ x: 400, y: 300 }, 800, 600),
  ).toBe(false);
});

test('allows positions just inside the padding', () => {
  expect(
    hasCanvasBoundaryCollision(
      { x: ARENA_PADDING + 1, y: ARENA_PADDING + 1 },
      800,
      600,
    ),
  ).toBe(false);
});
