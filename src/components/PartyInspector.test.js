import { fireEvent, render, screen } from '@testing-library/react';
import PartyInspector from './PartyInspector';

test('renders party leader and followers with real-time health and slot counter', () => {
  const onUpgrade = jest.fn();
  render(
    <PartyInspector
      leader={{ hp: 200, maxHp: 250 }}
      followers={[
        { id: 'f1', name: 'Bruxa de Gelo', classType: 'ice-witch', hp: 90, maxHp: 100 },
        { id: 'f2', name: 'Druida', classType: 'druid', hp: 60, maxHp: 100 },
      ]}
      maxPartySlots={7}
      coins={100}
      slotUpgradeCost={50}
      onSlotUpgrade={onUpgrade}
    />,
  );

  expect(screen.getByText('3/7')).toBeInTheDocument();
  expect(screen.getByText('Guerreiro (Líder)')).toBeInTheDocument();
  expect(screen.getByText('200/250')).toBeInTheDocument();
  expect(screen.getByText('Bruxa de Gelo')).toBeInTheDocument();
  expect(screen.getByText('90/100')).toBeInTheDocument();

  const buyButton = screen.getByRole('button', { name: '+1 Slot (50 moedas)' });
  expect(buyButton).toBeEnabled();
  fireEvent.click(buyButton);
  expect(onUpgrade).toHaveBeenCalledTimes(1);
});

test('disables slot purchase when player has insufficient coins', () => {
  render(
    <PartyInspector
      leader={{ hp: 250, maxHp: 250 }}
      followers={[]}
      maxPartySlots={7}
      coins={10}
      slotUpgradeCost={50}
    />,
  );

  expect(screen.getByRole('button', { name: '+1 Slot (50 moedas)' })).toBeDisabled();
});
