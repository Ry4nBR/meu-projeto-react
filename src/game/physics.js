export function checkCollision(entityA, entityB) {
  const distance = Math.hypot(entityB.x - entityA.x, entityB.y - entityA.y);
  return distance <= entityA.radius + entityB.radius;
}
