import { PARTICLE_LIFETIME } from './particles';
import { drawArenaBorder } from './boundaries';

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
  healingEffects = [],
  shockwaves = [],
  skeletons = [],
  coins = [],
  coinPickupEffects = [],
  recruits = [],
  particles = [],
) {
  context.clearRect(0, 0, width, height);
  drawArenaBorder(context, width, height);

  party.followers.forEach((follower) => {
    if (follower.classType === 'golden-paladin') {
      context.globalAlpha = 0.28;
      context.fillStyle = '#ffd700';
      context.beginPath();
      context.arc(
        follower.x,
        follower.y,
        follower.auraRange || 54,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.globalAlpha = 1;
      context.shadowColor = '#fff2a8';
      context.shadowBlur = 18;
    }
    context.globalAlpha =
      follower.hitRemaining > 0 &&
      Math.floor(follower.hitRemaining * 20) % 2 === 0
        ? 0.35
        : 1;
    context.fillStyle = follower.color || FOLLOWER_COLOR;
    context.beginPath();
    context.arc(follower.x, follower.y, FOLLOWER_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    drawHealthBar(context, follower, follower.radius || FOLLOWER_RADIUS);
  });

  context.globalAlpha =
    party.leader.hitRemaining > 0 &&
    Math.floor(party.leader.hitRemaining * 20) % 2 === 0
      ? 0.35
      : 1;
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

  healingEffects.forEach((effect) => {
    context.globalAlpha = Math.max(
      0,
      Math.min(1, effect.timeRemaining / 0.6),
    );
    context.strokeStyle = '#38ef7d';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(effect.x, effect.y, 20, 0, Math.PI * 2);
    context.stroke();
  });

  shockwaves.forEach((shockwave) => {
    context.globalAlpha = Math.max(
      0,
      1 - shockwave.radius / 120,
    );
    context.strokeStyle = '#b7f7ff';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(
      shockwave.x,
      shockwave.y,
      shockwave.radius,
      0,
      Math.PI * 2,
    );
    context.stroke();
  });

  skeletons.forEach((skeleton) => {
    context.globalAlpha =
      skeleton.hitRemaining > 0 &&
      Math.floor(skeleton.hitRemaining * 20) % 2 === 0
        ? 0.35
        : 1;
    context.fillStyle = '#d8c6ff';
    context.beginPath();
    context.arc(
      skeleton.x,
      skeleton.y,
      skeleton.radius || 7,
      0,
      Math.PI * 2,
    );
    context.fill();
    drawHealthBar(context, skeleton, skeleton.radius || 7);
  });

  coins.forEach((coin) => {
    context.globalAlpha = Math.max(0, Math.min(1, coin.timeRemaining / 10));
    context.fillStyle = '#ffd700';
    context.shadowColor = '#ffec8b';
    context.shadowBlur = 12;
    context.beginPath();
    context.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  });

  coinPickupEffects.forEach((effect) => {
    context.globalAlpha = Math.max(
      0,
      Math.min(1, effect.timeRemaining / 0.35),
    );
    context.strokeStyle = '#fff2a8';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(effect.x, effect.y, 14, 0, Math.PI * 2);
    context.stroke();
  });

  recruits.forEach((recruit) => {
    context.fillStyle = recruit.color || '#ffffff';
    if (recruit.isRare) {
      context.shadowColor = '#fff2a8';
      context.shadowBlur = 22;
    }
    context.beginPath();
    context.arc(recruit.x, recruit.y, recruit.radius || 11, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    context.fillStyle = '#ffffff';
    context.font = '10px sans-serif';
    context.textAlign = 'center';
    context.fillText(recruit.name, recruit.x, recruit.y - 16);
  });

  particles.forEach((particle) => {
    context.globalAlpha = Math.max(
      0,
      Math.min(1, particle.timeRemaining / PARTICLE_LIFETIME),
    );
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;
}
