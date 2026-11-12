export const FLOATING_TEXT_LIFETIME = 0.8;
export const FLOATING_TEXT_FLOAT_SPEED = 30;

export function createFloatingText(id, x, y, text, color = '#ff4d4d') {
  return {
    id,
    x,
    y,
    text: String(text),
    color,
    timeRemaining: FLOATING_TEXT_LIFETIME,
  };
}

export function advanceFloatingTexts(texts, deltaTime) {
  if (!texts || deltaTime <= 0) {
    return texts || [];
  }

  return texts
    .map((item) => ({
      ...item,
      y: item.y - FLOATING_TEXT_FLOAT_SPEED * deltaTime,
      timeRemaining: item.timeRemaining - deltaTime,
    }))
    .filter((item) => item.timeRemaining > 0);
}
