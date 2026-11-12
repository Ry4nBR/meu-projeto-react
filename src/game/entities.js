export function createCharacter({
  id,
  name,
  classType,
  hp,
  maxHp,
  atk,
  range,
  cooldown,
}) {
  return {
    id,
    name,
    classType,
    hp,
    maxHp,
    atk,
    range,
    cooldown,
  };
}

export function createEnemy({ id, x, y, hp, maxHp, atk, speed }) {
  return {
    id,
    x,
    y,
    hp,
    maxHp,
    atk,
    speed,
  };
}
