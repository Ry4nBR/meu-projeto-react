const LEADER_COLOR = '#ffd700';
const FOLLOWER_COLOR = '#4682b4';
const LEADER_RADIUS = 12;
const FOLLOWER_RADIUS = 9;
const ENEMY_RADIUS = 10;
const DIRECTION_LENGTH = 24;

export function drawParty(
  context,
  party,
  width = 800,
  height = 600,
  enemies = [],
) {
  context.clearRect(0, 0, width, height);

  party.followers.forEach((follower) => {
    context.fillStyle = FOLLOWER_COLOR;
    context.beginPath();
    context.arc(follower.x, follower.y, FOLLOWER_RADIUS, 0, Math.PI * 2);
    context.fill();
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
    context.fillStyle = '#d9534f';
    context.beginPath();
    context.arc(enemy.x, enemy.y, ENEMY_RADIUS, 0, Math.PI * 2);
    context.fill();
  });
}
