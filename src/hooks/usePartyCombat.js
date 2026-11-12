import { useRef, useState } from 'react';
import { createWarriorLeader, WARRIOR_CONFIG } from '../game/classes';
import { checkCollision } from '../game/physics';
import { useGameLoop } from './useGameLoop';

const INITIAL_HP = 100;
const DAMAGE_INTERVAL = 0.5;
const LEADER_RADIUS = 12;
const FOLLOWER_RADIUS = 9;
const ENEMY_RADIUS = 10;

function createInitialHealth(followers) {
  const warrior = createWarriorLeader();
  return {
    leader: { hp: warrior.hp, maxHp: warrior.maxHp },
    followers: Object.fromEntries(
      followers.map(({ id }) => [id, { hp: INITIAL_HP, maxHp: INITIAL_HP }]),
    ),
    enemies: {},
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
    const enemyHealth = health.enemies?.[enemy.id];
    if (enemyHealth && enemyHealth.hp <= 0) {
      return;
    }

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
            enemies: { ...health.enemies },
          };
        }

        if (member.id === 'leader') {
          nextHealth.leader.hp = Math.max(
            0,
            nextHealth.leader.hp -
              enemy.atk * (1 - WARRIOR_CONFIG.damageReduction),
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

function applyWarriorAttack(health, leader, enemies) {
  let nextHealth = health;

  enemies.forEach((enemy) => {
    const enemyHealth = nextHealth.enemies[enemy.id] || {
      hp: enemy.hp,
      maxHp: enemy.maxHp,
    };
    if (
      enemyHealth.hp <= 0 ||
      Math.hypot(enemy.x - leader.x, enemy.y - leader.y) > WARRIOR_CONFIG.range
    ) {
      return;
    }

    if (nextHealth === health) {
      nextHealth = {
        ...health,
        leader: { ...health.leader },
        followers: { ...health.followers },
        enemies: { ...health.enemies },
      };
    }

    nextHealth.enemies[enemy.id] = {
      ...enemyHealth,
      hp: Math.max(0, enemyHealth.hp - WARRIOR_CONFIG.atk),
    };
  });

  return nextHealth;
}

export function usePartyCombat(party, enemies, active = true) {
  const [health, setHealth] = useState(() =>
    createInitialHealth(party.followers),
  );
  const damageTimer = useRef(0);
  const warriorTimer = useRef(0);

  useGameLoop((deltaTime) => {
    damageTimer.current += deltaTime;
    warriorTimer.current += deltaTime;
    const canDamage = damageTimer.current >= DAMAGE_INTERVAL;
    const canAttack = warriorTimer.current >= WARRIOR_CONFIG.cooldown;
    if (!canDamage && !canAttack) {
      return;
    }

    if (canDamage) {
      damageTimer.current %= DAMAGE_INTERVAL;
    }
    if (canAttack) {
      warriorTimer.current %= WARRIOR_CONFIG.cooldown;
    }

    setHealth((currentHealth) => {
      let nextHealth = currentHealth;
      if (canDamage) {
        nextHealth = applyContactDamage(nextHealth, party, enemies);
      }
      if (canAttack) {
        nextHealth = applyWarriorAttack(nextHealth, party.leader, enemies);
      }
      return nextHealth;
    });
  }, active);

  return {
    party: {
      ...party,
      leader: {
        ...createWarriorLeader(),
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
    enemies: enemies
      .map((enemy) => ({
        ...enemy,
        ...(health.enemies[enemy.id] || {
          hp: enemy.hp,
          maxHp: enemy.maxHp,
        }),
        radius: enemy.radius || ENEMY_RADIUS,
      }))
      .filter((enemy) => enemy.hp > 0),
    isGameOver: health.leader.hp <= 0,
  };
}

export { applyContactDamage, applyWarriorAttack };
