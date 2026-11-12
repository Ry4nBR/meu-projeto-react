import {
  advanceFloatingTexts,
  createFloatingText,
  FLOATING_TEXT_LIFETIME,
  FLOATING_TEXT_FLOAT_SPEED,
} from './floatingText';

test('creates a floating combat text entry with position and lifetime', () => {
  const text = createFloatingText('dmg-1', 100, 200, '-25', '#ff4d4d');

  expect(text).toEqual({
    id: 'dmg-1',
    x: 100,
    y: 200,
    text: '-25',
    color: '#ff4d4d',
    timeRemaining: FLOATING_TEXT_LIFETIME,
  });
});

test('floats upward and expires after its lifetime', () => {
  const text = createFloatingText('heal-1', 100, 200, '+30', '#38ef7d');
  const advanced = advanceFloatingTexts([text], 0.2);

  expect(advanced[0].y).toBeCloseTo(200 - FLOATING_TEXT_FLOAT_SPEED * 0.2);
  expect(advanced[0].timeRemaining).toBeCloseTo(FLOATING_TEXT_LIFETIME - 0.2);

  expect(advanceFloatingTexts([text], FLOATING_TEXT_LIFETIME)).toEqual([]);
});
