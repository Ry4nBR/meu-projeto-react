import { fireEvent, render, screen } from '@testing-library/react';
import GameOverScreen from './GameOverScreen';

test('shows match statistics and lets the player request a restart', () => {
  const onRestart = jest.fn();
  render(
    <GameOverScreen
      wavesSurvived={4}
      enemiesDefeated={27}
      coinsCollected={83}
      onRestart={onRestart}
    />,
  );

  expect(screen.getByRole('dialog', { name: 'Game Over' })).toHaveTextContent(
    'Waves Sobrevividas4Total de Inimigos Derrotados27Moedas Coletadas83',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Jogar Novamente' }));

  expect(onRestart).toHaveBeenCalledTimes(1);
});
