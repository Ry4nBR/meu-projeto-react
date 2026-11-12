export const INITIAL_SLOT_UPGRADE_COST = 50;

export function getSlotUpgradeCost(upgradeCount) {
  return INITIAL_SLOT_UPGRADE_COST * (upgradeCount + 1);
}

export function purchaseSlotUpgrade({
  coins,
  maxPartySlots,
  upgradeCount,
}) {
  const cost = getSlotUpgradeCost(upgradeCount);
  if (coins < cost) {
    return {
      purchased: false,
      coins,
      maxPartySlots,
      upgradeCount,
      cost,
    };
  }

  return {
    purchased: true,
    coins: coins - cost,
    maxPartySlots: maxPartySlots + 1,
    upgradeCount: upgradeCount + 1,
    cost,
  };
}
