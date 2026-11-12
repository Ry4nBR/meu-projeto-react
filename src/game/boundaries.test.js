import { hasCanvasBoundaryCollision } from './boundaries';

test.each([
  [{ x: 0, y: 300 }],
  [{ x: 800, y: 300 }],
  [{ x: 400, y: 0 }],
  [{ x: 400, y: 600 }],
  [{ x: -1, y: 300 }],
  [{ x: 801, y: 300 }],
])('detects a leader at or beyond a canvas boundary: %o', (position) => {
  expect(hasCanvasBoundaryCollision(position, 800, 600)).toBe(true);
});

test('allows positions strictly inside the canvas', () => {
  expect(hasCanvasBoundaryCollision({ x: 400, y: 300 }, 800, 600)).toBe(
    false,
  );
});
