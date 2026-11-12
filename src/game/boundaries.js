export const ARENA_PADDING = 24;

export function hasCanvasBoundaryCollision(position, width, height) {
  return (
    position.x <= ARENA_PADDING ||
    position.x >= width - ARENA_PADDING ||
    position.y <= ARENA_PADDING ||
    position.y >= height - ARENA_PADDING
  );
}

export function drawArenaBorder(context, width, height) {
  context.fillStyle = '#2a1f1a';
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#1a1a2e';
  context.fillRect(
    ARENA_PADDING,
    ARENA_PADDING,
    width - ARENA_PADDING * 2,
    height - ARENA_PADDING * 2,
  );

  context.strokeStyle = '#ff4444';
  context.lineWidth = 2;
  context.shadowColor = '#ff4444';
  context.shadowBlur = 10;
  context.strokeRect(
    ARENA_PADDING,
    ARENA_PADDING,
    width - ARENA_PADDING * 2,
    height - ARENA_PADDING * 2,
  );
  context.shadowBlur = 0;

  context.strokeStyle = '#3d2e24';
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 16) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, ARENA_PADDING);
    context.stroke();
    context.beginPath();
    context.moveTo(x, height - ARENA_PADDING);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += 16) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(ARENA_PADDING, y);
    context.stroke();
    context.beginPath();
    context.moveTo(width - ARENA_PADDING, y);
    context.lineTo(width, y);
    context.stroke();
  }
}
