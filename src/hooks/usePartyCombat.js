import { useRef, useState } from 'react';
import { createWarriorLeader, WARRIOR_CONFIG } from '../game/classes';
import {
  advanceIceProjectile,
  createIceProjectile,
  createIceWitch,
  ICE_WITCH_CONFIG,
} from '../game/iceWitch';
import { createDruid, DRUID_CONFIG, healMostWounded } from '../game/druid';
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

function applyIceProjectileDamage(health, enemy) {
  const enemyHealth = health.enemies[enemy.id] || {
    hp: enemy.hp,
    maxHp: enemy.maxHp,
  };
  return {
    ...health,
    enemies: {
      ...health.enemies,
      [enemy.id]: {
        ...enemyHealth,
        hp: Math.max(0, enemyHealth.hp - ICE_WITCH_CONFIG.atk),
      },
    },
  };
}

export function usePartyCombat(
  party,
  enemies,
  active = true,
  applyEnemySlow = () => {},
) {
  const [health, setHealth] = useState(() =>
    createInitialHealth(party.followers),
  );
  const [projectiles, setProjectiles] = useState([]);
  const [healingEffects, setHealingEffects] = useState([]);
  const projectilesRef = useRef([]);
  const damageTimer = useRef(0);
  const warriorTimer = useRef(0);
  const iceWitchTimer = useRef(0);
  const druidTimer = useRef(0);
  const nextProjectileId = useRef(0);
  const nextHealingEffectId = useRef(0);

  useGameLoop((deltaTime) => {
    if (deltaTime <= 0) {
      return;
    }

    const livingEnemies = enemies.filter(
      (enemy) => (health.enemies[enemy.id]?.hp ?? enemy.hp) > 0,
    );
    damageTimer.current += deltaTime;
    warriorTimer.current += deltaTime;
    iceWitchTimer.current += deltaTime;
    druidTimer.current += deltaTime;
    const canDamage = damageTimer.current >= DAMAGE_INTERVAL;
    const canAttack = warriorTimer.current >= WARRIOR_CONFIG.cooldown;
    const canCast = iceWitchTimer.current >= ICE_WITCH_CONFIG.cooldown;
    const canHeal = druidTimer.current >= DRUID_CONFIG.cooldown;

    if (canDamage) {
      damageTimer.current %= DAMAGE_INTERVAL;
    }
    if (canAttack) {
      warriorTimer.current %= WARRIOR_CONFIG.cooldown;
    }
    if (canCast) {
      iceWitchTimer.current %= ICE_WITCH_CONFIG.cooldown;
    }
    if (canHeal) {
      druidTimer.current %= DRUID_CONFIG.cooldown;
    }

    setHealingEffects((currentEffects) => {
      if (currentEffects.length === 0) {
        return currentEffects;
      }

      return currentEffects
        .map((effect) => ({
          ...effect,
          timeRemaining: effect.timeRemaining - deltaTime,
        }))
        .filter((effect) => effect.timeRemaining > 0);
    });

    if (canDamage || canAttack || canHeal) {
      setHealth((currentHealth) => {
        let nextHealth = currentHealth;
        if (canDamage) {
          nextHealth = applyContactDamage(nextHealth, party, enemies);
        }
        if (canAttack) {
          nextHealth = applyWarriorAttack(nextHealth, party.leader, enemies);
        }
        if (
          canHeal &&
          party.followers.some(
            ({ id }) =>
              id === 'follower-1' &&
              currentHealth.followers[id]?.hp !== 0,
          )
        ) {
          nextHealth = healMostWounded(nextHealth, party).health;
        }
        return nextHealth;
      });
    }

    const druid = party.followers.find(
      ({ id }) =>
        id === 'follower-1' && health.followers[id]?.hp !== 0,
    );
    if (canHeal && druid) {
      const { target } = healMostWounded(health, party);
      if (target) {
        setHealingEffects((currentEffects) => [
          ...currentEffects,
          {
            id: `heal-${nextHealingEffectId.current}`,
            x: target.x,
            y: target.y,
            timeRemaining: DRUID_CONFIG.auraDuration,
          },
        ]);
        nextHealingEffectId.current += 1;
      }
    }

    let launchedProjectile = null;
    const iceWitch = party.followers.find(
      ({ id }) =>
        id === 'follower-0' && health.followers[id]?.hp !== 0,
    );
    if (canCast && iceWitch) {
      launchedProjectile = createIceProjectile(iceWitch, livingEnemies);
      if (launchedProjectile) {
        launchedProjectile.id = `ice-projectile-${nextProjectileId.current}`;
        nextProjectileId.current += 1;
      }
    }

    if (projectilesRef.current.length > 0 || launchedProjectile) {
      const currentProjectiles = launchedProjectile
        ? [...projectilesRef.current, launchedProjectile]
        : projectilesRef.current;
      const hits = [];
      const nextProjectiles = currentProjectiles.flatMap((projectile) => {
        const result = advanceIceProjectile(
          projectile,
          livingEnemies,
          deltaTime,
        );
        if (result.hit) {
          hits.push(result.hit);
          return [];
        }
        return result.projectile ? [result.projectile] : [];
      });

      projectilesRef.current = nextProjectiles;
      setProjectiles(nextProjectiles);

      hits.forEach(({ enemyId }) => {
        const enemy = livingEnemies.find(({ id }) => id === enemyId);
        if (enemy) {
          setHealth((currentHealth) =>
            applyIceProjectileDamage(currentHealth, enemy),
          );
          applyEnemySlow(enemyId, ICE_WITCH_CONFIG.slowDuration);
        }
      });
    }
  }, active);

  const iceWitch = createIceWitch();
  const druid = createDruid();
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
          ...(follower.id === iceWitch.id ? iceWitch : {}),
          ...(follower.id === druid.id ? druid : {}),
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
    projectiles,
    healingEffects,
    isGameOver: health.leader.hp <= 0,
  };
}

export {
  applyContactDamage,
  applyIceProjectileDamage,
  applyWarriorAttack,
};
