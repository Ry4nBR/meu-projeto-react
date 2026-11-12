const LEADER_COLOR = '#ffd700';
const FOLLOWER_COLOR = '#4682b4';
const LEADER_RADIUS = 12;
const FOLLOWER_RADIUS = 9;
const ENEMY_RADIUS = 10;
const DIRECTION_LENGTH = 24;
const HEALTH_BAR_WIDTH = 28;
const HEALTH_BAR_HEIGHT = 4;

function drawHealthBar(context, entity, radius) {
  if (typeof entity.hp !== 'number' || typeof entity.maxHp !== 'number') {
    return;
  }

  const healthRatio = Math.max(0, Math.min(1, entity.hp / entity.maxHp));
  const left = entity.x - HEALTH_BAR_WIDTH / 2;
  const top = entity.y - radius - HEALTH_BAR_HEIGHT - 4;

  context.fillStyle = '#d9534f';
  context.fillRect(left, top, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
  context.fillStyle = '#4caf50';
  context.fillRect(left, top, HEALTH_BAR_WIDTH * healthRatio, HEALTH_BAR_HEIGHT);
}

export function drawParty(
  context,
  party,
  width = 800,
  height = 600,
  enemies = [],
  projectiles = [],
) {
  context.clearRect(0, 0, width, height);

  party.followers.forEach((follower) => {
    context.fillStyle = FOLLOWER_COLOR;
    context.beginPath();
    context.arc(follower.x, follower.y, FOLLOWER_RADIUS, 0, Math.PI * 2);
    context.fill();
    drawHealthBar(context, follower, FOLLOWER_RADIUS);
  });

  context.fillStyle = LEADER_COLOR;
  context.beginPath();
  context.arc(
    party.leader.x,
    party.leader.y,
    LEADER_RADIUS,
    0,
    Math.PI * 2,
  );
  context.fill();
  drawHealthBar(context, party.leader, LEADER_RADIUS);

  context.strokeStyle = LEADER_COLOR;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(party.leader.x, party.leader.y);
  context.lineTo(
    party.leader.x + party.direction.x * DIRECTION_LENGTH,
    party.leader.y + party.direction.y * DIRECTION_LENGTH,
  );
  context.stroke();

  enemies.forEach((enemy) => {
    context.fillStyle = enemy.slowRemaining > 0 ? '#78d9ff' : '#d9534f';
    context.beginPath();
    context.arc(enemy.x, enemy.y, ENEMY_RADIUS, 0, Math.PI * 2);
    context.fill();
    drawHealthBar(context, enemy, ENEMY_RADIUS);
  });

  projectiles.forEach((projectile) => {
    context.fillStyle = '#9be7ff';
    context.beginPath();
    context.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
    context.fill();
  });
}
