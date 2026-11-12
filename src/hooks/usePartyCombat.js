import { useRef, useState } from 'react';
import { createWarriorLeader, WARRIOR_CONFIG } from '../game/classes';
import {
  advanceIceProjectile,
  createIceProjectile,
  createIceWitch,
  ICE_WITCH_CONFIG,
} from '../game/iceWitch';
import { createDruid, DRUID_CONFIG, healMostWounded } from '../game/druid';
import {
  advanceWindShockwave,
  createWindMage,
  createWindShockwave,
  WIND_MAGE_CONFIG,
} from '../game/windMage';
import {
  advanceSkeletons,
  createNecromancer,
  createSkeleton,
  NECROMANCER_CONFIG,
  SKELETON_CONFIG,
} from '../game/necromancer';
import { advanceCoinDrops, applyEnemyDamage } from '../game/coins';
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
    skeletons: {},
    coinDrops: [],
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
    ...(party.skeletons || []).map((skeleton) => ({
      ...skeleton,
      ...(health.skeletons?.[skeleton.id] || skeleton),
      radius: SKELETON_CONFIG.radius,
      id: `skeleton:${skeleton.id}`,
      skeletonId: skeleton.id,
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
            ...health,
            leader: { ...health.leader },
            followers: Object.fromEntries(
              Object.entries(health.followers).map(([id, follower]) => [
                id,
                { ...follower },
              ]),
            ),
            enemies: { ...health.enemies },
            skeletons: { ...(health.skeletons || {}) },
          };
        }

        if (member.id === 'leader') {
          nextHealth.leader.hp = Math.max(
            0,
            nextHealth.leader.hp -
              enemy.atk * (1 - WARRIOR_CONFIG.damageReduction),
          );
        } else if (member.skeletonId) {
          const skeletonHealth = nextHealth.skeletons[member.skeletonId] || {
            hp: SKELETON_CONFIG.hp,
            maxHp: SKELETON_CONFIG.hp,
          };
          nextHealth.skeletons[member.skeletonId] = {
            ...skeletonHealth,
            hp: Math.max(0, skeletonHealth.hp - enemy.atk),
          };
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
      nextHealth = { ...health, enemies: { ...health.enemies } };
    }

    nextHealth = applyEnemyDamage(
      nextHealth,
      enemy,
      WARRIOR_CONFIG.atk,
    );
  });

  return nextHealth;
}

function applyIceProjectileDamage(health, enemy) {
  return applyEnemyDamage(health, enemy, ICE_WITCH_CONFIG.atk);
}

function applyWindShockwaveDamage(health, enemy) {
  return applyEnemyDamage(health, enemy, WIND_MAGE_CONFIG.atk);
}

function applySkeletonDamage(health, enemyId, damage) {
  return applyEnemyDamage(health, enemyId, damage);
}

export function usePartyCombat(
  party,
  enemies,
  active = true,
  applyEnemySlow = () => {},
  applyEnemyKnockback = () => {},
) {
  const [health, setHealth] = useState(() =>
    createInitialHealth(party.followers),
  );
  const [projectiles, setProjectiles] = useState([]);
  const [healingEffects, setHealingEffects] = useState([]);
  const [shockwaves, setShockwaves] = useState([]);
  const [skeletons, setSkeletons] = useState([]);
  const projectilesRef = useRef([]);
  const shockwavesRef = useRef([]);
  const skeletonsRef = useRef([]);
  const damageTimer = useRef(0);
  const warriorTimer = useRef(0);
  const iceWitchTimer = useRef(0);
  const druidTimer = useRef(0);
  const windMageTimer = useRef(0);
  const necromancerTimer = useRef(0);
  const nextProjectileId = useRef(0);
  const nextHealingEffectId = useRef(0);
  const nextShockwaveId = useRef(0);
  const nextSkeletonId = useRef(0);

  useGameLoop((deltaTime) => {
    if (deltaTime <= 0) {
      return;
    }

    setHealth((currentHealth) => {
      if (!currentHealth.coinDrops?.length) {
        return currentHealth;
      }

      return {
        ...currentHealth,
        coinDrops: advanceCoinDrops(currentHealth.coinDrops, deltaTime),
      };
    });

    const livingEnemies = enemies.filter(
      (enemy) => (health.enemies[enemy.id]?.hp ?? enemy.hp) > 0,
    );
    damageTimer.current += deltaTime;
    warriorTimer.current += deltaTime;
    iceWitchTimer.current += deltaTime;
    druidTimer.current += deltaTime;
    windMageTimer.current += deltaTime;
    const necromancer = party.followers.find(
      ({ id }) =>
        id === 'follower-3' && health.followers[id]?.hp !== 0,
    );
    if (necromancer) {
      necromancerTimer.current += deltaTime;
      while (necromancerTimer.current >= NECROMANCER_CONFIG.cooldown) {
        necromancerTimer.current -= NECROMANCER_CONFIG.cooldown;
        const skeleton = createSkeleton(
          `skeleton-${nextSkeletonId.current}`,
          necromancer,
        );
        nextSkeletonId.current += 1;
        skeletonsRef.current = [...skeletonsRef.current, skeleton];
        setHealth((currentHealth) => ({
          ...currentHealth,
          skeletons: {
            ...currentHealth.skeletons,
            [skeleton.id]: { hp: skeleton.hp, maxHp: skeleton.maxHp },
          },
        }));
      }
    }

    const activeSkeletons = skeletonsRef.current.filter(
      (skeleton) =>
        (health.skeletons?.[skeleton.id]?.hp ?? skeleton.hp) > 0,
    );
    const skeletonParty = { ...party, skeletons: activeSkeletons };
    const skeletonTurn = advanceSkeletons(
      activeSkeletons,
      livingEnemies,
      deltaTime,
    );
    skeletonsRef.current = skeletonTurn.skeletons;
    setSkeletons(skeletonTurn.skeletons);
    skeletonTurn.hits.forEach(({ enemyId, skeletonId }) => {
      const skeleton = skeletonTurn.skeletons.find(
        ({ id }) => id === skeletonId,
      );
      if (skeleton) {
        setHealth((currentHealth) =>
          applySkeletonDamage(
            currentHealth,
            enemies.find(({ id }) => id === enemyId),
            skeleton.atk,
          ),
        );
      }
    });

    const canDamage = damageTimer.current >= DAMAGE_INTERVAL;
    const canAttack = warriorTimer.current >= WARRIOR_CONFIG.cooldown;
    const canCast = iceWitchTimer.current >= ICE_WITCH_CONFIG.cooldown;
    const canHeal = druidTimer.current >= DRUID_CONFIG.cooldown;
    const canShockwave =
      windMageTimer.current >= WIND_MAGE_CONFIG.cooldown;

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
    if (canShockwave) {
      windMageTimer.current %= WIND_MAGE_CONFIG.cooldown;
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
          nextHealth = applyContactDamage(
            nextHealth,
            skeletonParty,
            enemies,
          );
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

    const windMage = party.followers.find(
      ({ id }) =>
        id === 'follower-2' && health.followers[id]?.hp !== 0,
    );
    let launchedShockwave = null;
    if (canShockwave && windMage) {
      launchedShockwave = createWindShockwave(
        windMage,
        `wind-shockwave-${nextShockwaveId.current}`,
      );
      nextShockwaveId.current += 1;
    }

    if (shockwavesRef.current.length > 0 || launchedShockwave) {
      const currentShockwaves = launchedShockwave
        ? [...shockwavesRef.current, launchedShockwave]
        : shockwavesRef.current;
      const hits = [];
      const nextShockwaves = currentShockwaves.flatMap((shockwave) => {
        const result = advanceWindShockwave(
          shockwave,
          livingEnemies,
          deltaTime,
        );
        hits.push(...result.hits);
        return result.shockwave ? [result.shockwave] : [];
      });

      shockwavesRef.current = nextShockwaves;
      setShockwaves(nextShockwaves);

      hits.forEach(({ enemyId, origin }) => {
        const enemy = livingEnemies.find(({ id }) => id === enemyId);
        if (enemy) {
          setHealth((currentHealth) =>
            applyWindShockwaveDamage(currentHealth, enemy),
          );
          applyEnemyKnockback(enemyId, origin);
        }
      });
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
  const windMage = createWindMage();
  const necromancer = createNecromancer();
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
          ...(follower.id === windMage.id ? windMage : {}),
          ...(follower.id === necromancer.id ? necromancer : {}),
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
    shockwaves,
    coinDrops: health.coinDrops || [],
    skeletons: skeletons
      .map((skeleton) => ({
        ...skeleton,
        ...(health.skeletons?.[skeleton.id] || {
          hp: skeleton.hp,
          maxHp: skeleton.maxHp,
        }),
      }))
      .filter((skeleton) => skeleton.hp > 0),
    isGameOver: health.leader.hp <= 0,
  };
}

export {
  applyContactDamage,
  applyIceProjectileDamage,
  applySkeletonDamage,
  applyWindShockwaveDamage,
  applyWarriorAttack,
};
