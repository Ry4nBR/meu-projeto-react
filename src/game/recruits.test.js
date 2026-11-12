import {
  collectRecruit,
  createRecruit,
  RECRUIT_CLASSES,
} from './recruits';

test('creates a recruit with a random class and a free position inside the map', () => {
  const recruit = createRecruit('recruit-1', () => 0.5);

  expect(recruit).toMatchObject({
    id: 'recruit-1',
    classType: RECRUIT_CLASSES[2].classType,
    name: RECRUIT_CLASSES[2].name,
    hp: 100,
    maxHp: 100,
  });
  expect(recruit.x).toBeGreaterThanOrEqual(40);
  expect(recruit.x).toBeLessThanOrEqual(760);
  expect(recruit.y).toBeGreaterThanOrEqual(40);
  expect(recruit.y).toBeLessThanOrEqual(560);
});

test('recruits a touched hero when a slot is available', () => {
  const recruit = {
    id: 'recruit-1',
    x: 15,
    y: 10,
    radius: 5,
    classType: 'druid',
  };
  const result = collectRecruit(
    [recruit],
    { leader: { x: 0, y: 10, radius: 12 }, followers: [] },
    7,
  );

  expect(result.recruited).toBe(recruit);
  expect(result.recruits).toEqual([]);
});

test('keeps recruits on the map when the party is full or has no contact', () => {
  const recruit = { id: 'recruit-1', x: 100, y: 100, radius: 5 };
  const party = {
    leader: { x: 0, y: 0, radius: 12 },
    followers: [],
  };

  expect(collectRecruit([recruit], party, 1).recruited).toBeNull();
  expect(collectRecruit([recruit], party, 7).recruits).toEqual([recruit]);
});
