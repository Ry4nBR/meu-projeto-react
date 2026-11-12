import { useState } from 'react';
import { createEnemy } from '../game/entities';
import { useGameLoop } from './useGameLoop';

const INITIAL_ENEMIES = [
  { id: 'enemy-1', x: 0, y: 0 },
  { id: 'enemy-2', x: 800, y: 600 },
  { id: 'enemy-3', x: 400, y: 0 },
];
const ENEMY_HP = 50;
const ENEMY_ATTACK = 8;
const ENEMY_SPEED = 45;

function createInitialEnemies() {
  return INITIAL_ENEMIES.map(({ id, x, y }) =>
    createEnemy({
      id,
      x,
      y,
      hp: ENEMY_HP,
      maxHp: ENEMY_HP,
      atk: ENEMY_ATTACK,
      speed: ENEMY_SPEED,
    }),
  );
}

function findNearestTarget(enemy, party) {
  return [party.leader, ...party.followers].reduce((nearest, member) => {
    const distance = Math.hypot(member.x - enemy.x, member.y - enemy.y);
    return distance < nearest.distance
      ? { member, distance }
      : nearest;
  }, { member: party.leader, distance: Infinity }).member;
}

export function advanceEnemies(enemies, party, deltaTime) {
  return enemies.map((enemy) => {
    const target = findNearestTarget(enemy, party);
    const offsetX = target.x - enemy.x;
    const offsetY = target.y - enemy.y;
    const distance = Math.hypot(offsetX, offsetY);

    if (distance === 0 || deltaTime <= 0) {
      return enemy;
    }

    const movement = Math.min(enemy.speed * deltaTime, distance);
    return {
      ...enemy,
      x: enemy.x + (offsetX / distance) * movement,
      y: enemy.y + (offsetY / distance) * movement,
    };
  });
}

export function useEnemyPursuit(party) {
  const [enemies, setEnemies] = useState(createInitialEnemies);

  useGameLoop((deltaTime) => {
    if (deltaTime <= 0) {
      return;
    }

    setEnemies((currentEnemies) =>
      advanceEnemies(currentEnemies, party, deltaTime),
    );
  });

  return enemies;
}
