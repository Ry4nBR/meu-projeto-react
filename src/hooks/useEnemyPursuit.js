import { useCallback, useState } from 'react';
import { createEnemy } from '../game/entities';
import { ICE_WITCH_CONFIG } from '../game/iceWitch';
import { getWindKnockbackPosition } from '../game/windMage';
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
      slowRemaining: 0,
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

    if (deltaTime <= 0) {
      return enemy;
    }

    const slowedDuration = Math.min(
      enemy.slowRemaining || 0,
      deltaTime,
    );
    if (distance === 0) {
      return {
        ...enemy,
        slowRemaining: Math.max(0, (enemy.slowRemaining || 0) - deltaTime),
      };
    }

    const movement = Math.min(
      enemy.speed *
        (deltaTime - slowedDuration * (1 - ICE_WITCH_CONFIG.slowFactor)),
      distance,
    );
    return {
      ...enemy,
      x: enemy.x + (offsetX / distance) * movement,
      y: enemy.y + (offsetY / distance) * movement,
      slowRemaining: Math.max(0, (enemy.slowRemaining || 0) - deltaTime),
    };
  });
}

export function useEnemyPursuit(
  party,
  active = true,
  initialEnemies = createInitialEnemies,
) {
  const [enemies, setEnemies] = useState(initialEnemies);
  const spawnEnemies = useCallback((newEnemies) => {
    setEnemies((currentEnemies) => [...currentEnemies, ...newEnemies]);
  }, []);
  const applySlow = useCallback((enemyId, duration) => {
    setEnemies((currentEnemies) =>
      currentEnemies.map((enemy) =>
        enemy.id === enemyId
          ? {
              ...enemy,
              slowRemaining: Math.max(enemy.slowRemaining || 0, duration),
            }
          : enemy,
      ),
    );
  }, []);
  const applyKnockback = useCallback((enemyId, origin) => {
    setEnemies((currentEnemies) =>
      currentEnemies.map((enemy) =>
        enemy.id === enemyId
          ? { ...enemy, ...getWindKnockbackPosition(enemy, origin) }
          : enemy,
      ),
    );
  }, []);

  useGameLoop((deltaTime) => {
    if (deltaTime <= 0) {
      return;
    }

    setEnemies((currentEnemies) =>
      advanceEnemies(currentEnemies, party, deltaTime),
    );
  }, active);

  return { enemies, applySlow, applyKnockback, spawnEnemies };
}
