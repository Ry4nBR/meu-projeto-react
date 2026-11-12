import { checkCollision } from './physics';

export const RECRUIT_SPAWN_INTERVAL = 20;
export const RECRUIT_CLASSES = [
  { classType: 'druid', name: 'Druida', color: '#38ef7d' },
  { classType: 'ice-witch', name: 'Bruxa de Gelo', color: '#9be7ff' },
  { classType: 'wind-mage', name: 'Mago de Vento', color: '#b7f7ff' },
  { classType: 'necromancer', name: 'Necromante', color: '#d8c6ff' },
];

export function createRecruit(id, random = Math.random) {
  const classIndex = Math.floor(random() * RECRUIT_CLASSES.length);
  const classInfo = RECRUIT_CLASSES[classIndex];
  return {
    id,
    ...classInfo,
    x: 40 + random() * 720,
    y: 40 + random() * 520,
    radius: 11,
    hp: 100,
    maxHp: 100,
  };
}

export function collectRecruit(recruits, party, maxPartySlots) {
  if (party.followers.length + 1 >= maxPartySlots) {
    return { recruits, recruited: null };
  }

  const members = [party.leader, ...party.followers];
  const recruit = recruits.find((candidate) =>
    members.some((member) =>
      checkCollision(
        { ...member, radius: member.radius || 12 },
        { ...candidate, radius: candidate.radius || 11 },
      ),
    ),
  );

  if (!recruit) {
    return { recruits, recruited: null };
  }

  return {
    recruits: recruits.filter(({ id }) => id !== recruit.id),
    recruited: recruit,
  };
}
