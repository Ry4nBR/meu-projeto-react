import { addPartyMember, canAddPartyMember } from './partyRoster';

test('allows recruiting up to the party slot limit and rejects additional members', () => {
  const roster = ['follower-0', 'follower-1', 'follower-2', 'follower-3'];
  expect(canAddPartyMember(roster.length + 1, 7)).toBe(true);

  const added = addPartyMember(roster, 'follower-4', 7);
  expect(added.added).toBe(true);
  expect(added.followerIds).toHaveLength(5);

  const fullRoster = ['follower-0', 'follower-1', 'follower-2', 'follower-3', 'follower-4', 'follower-5'];
  const rejected = addPartyMember(fullRoster, 'follower-6', 7);
  expect(rejected.added).toBe(false);
  expect(rejected.followerIds).toBe(fullRoster);
});

test('does not add the same follower more than once', () => {
  const roster = ['follower-0'];
  expect(addPartyMember(roster, 'follower-0', 7)).toEqual({
    followerIds: roster,
    added: false,
  });
});
