import {
  getSlotUpgradeCost,
  purchaseSlotUpgrade,
} from './shop';

test('increases the slot upgrade cost after each purchase', () => {
  expect(getSlotUpgradeCost(0)).toBe(50);
  expect(getSlotUpgradeCost(1)).toBe(100);
  expect(getSlotUpgradeCost(2)).toBe(150);
});

test('spends the cost and adds one party slot when a purchase is affordable', () => {
  expect(
    purchaseSlotUpgrade({
      coins: 120,
      maxPartySlots: 7,
      upgradeCount: 1,
    }),
  ).toEqual({
    purchased: true,
    coins: 20,
    maxPartySlots: 8,
    upgradeCount: 2,
    cost: 100,
  });
});

test('rejects a purchase when the player has insufficient coins', () => {
  expect(
    purchaseSlotUpgrade({
      coins: 49,
      maxPartySlots: 7,
      upgradeCount: 0,
    }),
  ).toEqual({
    purchased: false,
    coins: 49,
    maxPartySlots: 7,
    upgradeCount: 0,
    cost: 50,
  });
});
