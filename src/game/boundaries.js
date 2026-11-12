export function hasCanvasBoundaryCollision(position, width, height) {
  return (
    position.x <= 0 ||
    position.x >= width ||
    position.y <= 0 ||
    position.y >= height
  );
}
