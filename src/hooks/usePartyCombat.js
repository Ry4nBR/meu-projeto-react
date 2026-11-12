import { useCallback, useRef, useState } from 'react';
import { createWarriorLeader, WARRIOR_CONFIG, isInMeleeArc } from '../game/classes';
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
import {
  applyEnemyDamage,
  collectCoinDrops,
  PICKUP_EFFECT_DURATION,
} from '../game/coins';
import { checkCollision } from '../game/physics';
import { advanceParticles, createParticleBurst } from '../game/particles';
import { useGameLoop } from './useGameLoop';

const INITIAL_HP = 100;
const DAMAGE_INTERVAL = 0.5;
const LEADER_RADIUS = 12;
const FOLLOWER_RADIUS = 9;
const ENEMY_RADIUS = 10;
const DEFAULT_FOLLOWER_HEALTH = 100;

function getFollowerHealth(follower) {
  const maxHp = follower.maxHp || DEFAULT_FOLLOWER_HEALTH;
  return { hp: follower.hp || maxHp, maxHp };
}

function createInitialHealth(followers) {
  const warrior = createWarriorLeader();
  return {
    leader: { hp: warrior.hp, maxHp: warrior.maxHp },
    followers: Object.fromEntries(
      followers.map((follower) => [
        follower.id,
        getFollowerHealth(follower),
      ]),
    ),
    enemies: {},
    skeletons: {},
    coinDrops: [],
    enemiesDefeated: 0,
  };
}

export function getContactDamageTargets(health, party, enemies) {
  const members = [
    { ...party.leader, ...health.leader, radius: LEADER_RADIUS, id: 'leader' },
    ...party.followers.map((follower) => ({
      ...follower,
      ...(health.followers[follower.id] || getFollowerHealth(follower)),
      radius: FOLLOWER_RADIUS,
      id: follower.id,
    })),
    ...(party.skeletons || []).map((skeleton) => ({
      ...skeleton,
      ...(health.skeletons?.[skeleton.id] || skeleton),
      radius: SKELETON_CONFIG.radius,
      id: `skeleton:${skeleton.id}`,
    })),
  ];
  const targets = new Set();

  enemies.forEach((enemy) => {
    if ((health.enemies?.[enemy.id]?.hp ?? enemy.hp) <= 0) {
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
        targets.add(member.id);
      }
    });
  });

  return [...targets];
}

function applyContactDamage(health, party, enemies) {
  const members = [
    { ...party.leader, ...health.leader, radius: LEADER_RADIUS, id: 'leader' },
    ...party.followers.map((follower) => ({
      ...follower,
      ...(health.followers[follower.id] || getFollowerHealth(follower)),
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

function applyWarriorAttack(health, leader, enemies, direction) {
  let nextHealth = health;

  enemies.forEach((enemy) => {
    const enemyHealth = nextHealth.enemies[enemy.id] || {
      hp: enemy.hp,
      maxHp: enemy.maxHp,
    };
    if (
      enemyHealth.hp <= 0 ||
      !isInMeleeArc(leader, direction, enemy)
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

export function applyGoldenPaladinAura(health, followers, enemies, deltaTime) {
  return followers.reduce(
    (nextHealth, paladin) =>
      enemies.reduce((enemyHealth, enemy) => {
        if (
          Math.hypot(enemy.x - paladin.x, enemy.y - paladin.y) >
          paladin.auraRange
        ) {
          return enemyHealth;
        }

        return applyEnemyDamage(
          enemyHealth,
          enemy,
          paladin.auraDamage * deltaTime,
        );
      }, nextHealth),
    health,
  );
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
  const [coins, setCoins] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [coinPickupEffects, setCoinPickupEffects] = useState([]);
  const [particles, setParticles] = useState([]);
  const [hitEffects, setHitEffects] = useState({});
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
  const nextCoinEffectId = useRef(0);
  const nextParticleBurstId = useRef(0);
  const emitParticles = (x, y, color) => {
    const burst = createParticleBurst(
      `particle-${nextParticleBurstId.current}`,
      x,
      y,
      color,
    );
    nextParticleBurstId.current += 1;
    setParticles((currentParticles) => [...currentParticles, ...burst]);
  };

  const spendCoins = useCallback(
    (amount) => {
      if (amount < 0 || coins < amount) {
        return false;
      }

      setCoins((currentCoins) => Math.max(0, currentCoins - amount));
      return true;
    },
    [coins],
  );
  const addCoins = useCallback((amount) => {
    setCoins((currentCoins) => currentCoins + amount);
    setCoinsCollected((currentTotal) => currentTotal + amount);
  }, []);

  useGameLoop((deltaTime) => {
    if (deltaTime <= 0) {
      return;
    }

    if (particles.length > 0) {
      setParticles((currentParticles) =>
        advanceParticles(currentParticles, deltaTime),
      );
    }
    if (Object.keys(hitEffects).length > 0) {
      setHitEffects((currentEffects) =>
        Object.fromEntries(
          Object.entries(currentEffects)
            .map(([id, timeRemaining]) => [
              id,
              Math.max(0, timeRemaining - deltaTime),
            ])
            .filter(([, timeRemaining]) => timeRemaining > 0),
        ),
      );
    }

    const collection = collectCoinDrops(
      health.coinDrops || [],
      { leader: party.leader, followers: party.followers },
      deltaTime,
    );
    if (health.coinDrops?.length) {
      setHealth((currentHealth) => ({
        ...currentHealth,
        coinDrops: collection.remaining,
      }));
    }

    if (collection.collected.length > 0) {
      const collectedValue = collection.collected.reduce(
        (total, coin) => total + coin.value,
        0,
      );
      setCoins((currentCoins) =>
        currentCoins + collectedValue,
      );
      setCoinsCollected((currentTotal) => currentTotal + collectedValue);
      setCoinPickupEffects((currentEffects) => [
        ...currentEffects,
        ...collection.collected.map((coin) => ({
          id: `pickup-${nextCoinEffectId.current++}`,
          x: coin.x,
          y: coin.y,
          timeRemaining: PICKUP_EFFECT_DURATION,
        })),
      ]);
      collection.collected.forEach((coin) =>
        emitParticles(coin.x, coin.y, '#ffd700'),
      );
    }

    if (coinPickupEffects.length > 0) {
      setCoinPickupEffects((currentEffects) =>
        currentEffects
          .map((effect) => ({
            ...effect,
            timeRemaining: effect.timeRemaining - deltaTime,
          }))
          .filter((effect) => effect.timeRemaining > 0),
      );
    }

    const livingEnemies = enemies.filter(
      (enemy) => (health.enemies[enemy.id]?.hp ?? enemy.hp) > 0,
    );
    const goldenPaladins = party.followers.filter(
      ({ classType, id }) =>
        classType === 'golden-paladin' &&
        (health.followers[id]?.hp ?? DEFAULT_FOLLOWER_HEALTH) > 0,
    );
    if (goldenPaladins.length > 0 && livingEnemies.length > 0) {
      setHealth((currentHealth) =>
        applyGoldenPaladinAura(
          currentHealth,
          goldenPaladins,
          livingEnemies,
          deltaTime,
        ),
      );
    }
    damageTimer.current += deltaTime;
    warriorTimer.current += deltaTime;
    iceWitchTimer.current += deltaTime;
    druidTimer.current += deltaTime;
    windMageTimer.current += deltaTime;
    const necromancer = party.followers.find(
      ({ id, classType }) =>
        (id === 'follower-3' || classType === 'necromancer') &&
        health.followers[id]?.hp !== 0,
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
        const enemy = enemies.find(({ id }) => id === enemyId);
        if (enemy) {
          emitParticles(enemy.x, enemy.y, '#d8c6ff');
        }
        setHealth((currentHealth) =>
          applySkeletonDamage(
            currentHealth,
            enemy,
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
      livingEnemies
        .filter(
          (enemy) => isInMeleeArc(party.leader, party.direction, enemy),
        )
        .forEach((enemy) => emitParticles(enemy.x, enemy.y, '#ffd700'));
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
      if (canDamage) {
        const damagedIds = getContactDamageTargets(
          health,
          skeletonParty,
          enemies,
        );
        if (damagedIds.length > 0) {
          setHitEffects((currentEffects) => ({
            ...currentEffects,
            ...Object.fromEntries(damagedIds.map((id) => [id, 0.15])),
          }));
        }
      }

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
          nextHealth = applyWarriorAttack(nextHealth, party.leader, enemies, party.direction);
        }
        if (
          canHeal &&
          party.followers.some(
            ({ id, classType }) =>
              (id === 'follower-1' || classType === 'druid') &&
              currentHealth.followers[id]?.hp !== 0,
          )
        ) {
          nextHealth = healMostWounded(nextHealth, party).health;
        }
        return nextHealth;
      });
    }

    const druid = party.followers.find(
      ({ id, classType }) =>
        (id === 'follower-1' || classType === 'druid') &&
        health.followers[id]?.hp !== 0,
    );
    if (canHeal && druid) {
      const { target } = healMostWounded(health, party);
      if (target) {
        emitParticles(target.x, target.y, '#38ef7d');
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
      ({ id, classType }) =>
        (id === 'follower-2' || classType === 'wind-mage') &&
        health.followers[id]?.hp !== 0,
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
          emitParticles(enemy.x, enemy.y, '#b7f7ff');
          setHealth((currentHealth) =>
            applyWindShockwaveDamage(currentHealth, enemy),
          );
          applyEnemyKnockback(enemyId, origin);
        }
      });
    }

    let launchedProjectile = null;
    const iceWitch = party.followers.find(
      ({ id, classType }) =>
        (id === 'follower-0' || classType === 'ice-witch') &&
        health.followers[id]?.hp !== 0,
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
          emitParticles(enemy.x, enemy.y, '#9be7ff');
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
        hitRemaining: hitEffects.leader || 0,
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
            ...getFollowerHealth(follower),
          }),
          hitRemaining: hitEffects[follower.id] || 0,
          radius:
            follower.classType === 'golden-paladin'
              ? follower.radius
              : FOLLOWER_RADIUS,
        }))
        .filter((follower) => follower.hp > 0),
    },
    leaderDead: health.leader.hp <= 0,
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
    coins,
    coinsCollected,
    enemiesDefeated: health.enemiesDefeated || 0,
    addCoins,
    spendCoins,
    coinPickupEffects,
    particles,
    hitEffects,
    skeletons: skeletons
      .map((skeleton) => ({
        ...skeleton,
        hitRemaining: hitEffects[`skeleton:${skeleton.id}`] || 0,
        ...(health.skeletons?.[skeleton.id] || {
          hp: skeleton.hp,
          maxHp: skeleton.maxHp,
        }),
      }))
      .filter((skeleton) => skeleton.hp > 0),
    isGameOver:
      health.leader.hp <= 0 &&
      party.followers.filter(
        (f) => (health.followers[f.id]?.hp ?? DEFAULT_FOLLOWER_HEALTH) > 0,
      ).length === 0,
  };
}

export {
  applyContactDamage,
  applyIceProjectileDamage,
  applySkeletonDamage,
  applyWindShockwaveDamage,
  applyWarriorAttack,
};
