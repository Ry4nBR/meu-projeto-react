export function canAddPartyMember(partySize, maxPartySlots) {
  return partySize < maxPartySlots;
}

export function addPartyMember(followerIds, followerId, maxPartySlots) {
  const partySize = followerIds.length + 1;
  if (
    followerIds.includes(followerId) ||
    !canAddPartyMember(partySize, maxPartySlots)
  ) {
    return { followerIds, added: false };
  }

  return {
    followerIds: [...followerIds, followerId],
    added: true,
  };
}
