import { checkCollision } from './physics';

test('detects overlapping circles', () => {
  expect(
    checkCollision(
      { x: 0, y: 0, radius: 5 },
      { x: 8, y: 0, radius: 5 },
    ),
  ).toBe(true);
});

test('counts circles touching at their boundaries as colliding', () => {
  expect(
    checkCollision(
      { x: 0, y: 0, radius: 5 },
      { x: 6, y: 8, radius: 5 },
    ),
  ).toBe(true);
});

test('does not detect separated circles as colliding', () => {
  expect(
    checkCollision(
      { x: 0, y: 0, radius: 5 },
      { x: 11, y: 0, radius: 5 },
    ),
  ).toBe(false);
});
