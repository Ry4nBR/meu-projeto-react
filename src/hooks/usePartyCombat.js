import { useRef, useState } from 'react';
import { checkCollision } from '../game/physics';
import { useGameLoop } from './useGameLoop';

const INITIAL_HP = 100;
const DAMAGE_INTERVAL = 0.5;
const LEADER_RADIUS = 12;
const FOLLOWER_RADIUS = 9;
const ENEMY_RADIUS = 10;

function createInitialHealth(followers) {
  return {
    leader: { hp: INITIAL_HP, maxHp: INITIAL_HP },
    followers: Object.fromEntries(
      followers.map(({ id }) => [id, { hp: INITIAL_HP, maxHp: INITIAL_HP }]),
    ),
  };
}

function applyContactDamage(health, party, enemies) {
  const members = [
    { ...party.leader, ...health.leader, radius: LEADER_RADIUS, id: 'leader' },
    ...party.followers.map((follower) => ({
      ...follower,
      ...(health.followers[follower.id] || {
        hp: INITIAL_HP,
        maxHp: INITIAL_HP,
      }),
      radius: FOLLOWER_RADIUS,
      id: follower.id,
    })),
  ];
  let nextHealth = health;

  enemies.forEach((enemy) => {
    members.forEach((member) => {
      if (
        member.hp > 0 &&
        checkCollision(
          { ...member, radius: member.radius },
          { ...enemy, radius: enemy.radius || ENEMY_RADIUS },
        )
      ) {
        if (nextHealth === health) {
          nextHealth = {
            leader: { ...health.leader },
            followers: Object.fromEntries(
              Object.entries(health.followers).map(([id, follower]) => [
                id,
                { ...follower },
              ]),
            ),
          };
        }

        if (member.id === 'leader') {
          nextHealth.leader.hp = Math.max(
            0,
            nextHealth.leader.hp - enemy.atk,
          );
        } else {
          const followerHealth = nextHealth.followers[member.id] || {
            hp: INITIAL_HP,
            maxHp: INITIAL_HP,
          };
          nextHealth.followers[member.id] = {
            ...followerHealth,
            hp: Math.max(0, followerHealth.hp - enemy.atk),
          };
        }
      }
    });
  });

  return nextHealth;
}

export function usePartyCombat(party, enemies, active = true) {
  const [health, setHealth] = useState(() =>
    createInitialHealth(party.followers),
  );
  const damageTimer = useRef(0);

  useGameLoop((deltaTime) => {
    damageTimer.current += deltaTime;
    if (damageTimer.current < DAMAGE_INTERVAL) {
      return;
    }

    damageTimer.current %= DAMAGE_INTERVAL;
    setHealth((currentHealth) =>
      applyContactDamage(currentHealth, party, enemies),
    );
  }, active);

  return {
    party: {
      ...party,
      leader: {
        ...party.leader,
        ...health.leader,
        radius: LEADER_RADIUS,
      },
      followers: party.followers
        .map((follower) => ({
          ...follower,
          ...(health.followers[follower.id] || {
            hp: INITIAL_HP,
            maxHp: INITIAL_HP,
          }),
          radius: FOLLOWER_RADIUS,
        }))
        .filter((follower) => follower.hp > 0),
    },
    enemies: enemies.map((enemy) => ({
      ...enemy,
      radius: enemy.radius || ENEMY_RADIUS,
    })),
    isGameOver: health.leader.hp <= 0,
  };
}

export { applyContactDamage };
