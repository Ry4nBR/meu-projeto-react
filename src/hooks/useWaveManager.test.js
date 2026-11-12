import { act, render, screen } from '@testing-library/react';
import { useWaveManager } from './useWaveManager';

function WaveHarness({ spawnEnemies }) {
  const { wave, countdown } = useWaveManager(spawnEnemies);
  return <output aria-label="wave">{`${wave}:${countdown}`}</output>;
}

let scheduledFrame;

beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    scheduledFrame = callback;
    return 1;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('spawns wave one immediately and advances the wave after the countdown', () => {
  const spawnEnemies = jest.fn();
  render(<WaveHarness spawnEnemies={spawnEnemies} />);

  expect(screen.getByLabelText('wave')).toHaveTextContent('1:30');
  expect(spawnEnemies).not.toHaveBeenCalled();

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(30000));

  expect(screen.getByLabelText('wave')).toHaveTextContent('2:30');
  expect(spawnEnemies).toHaveBeenCalledTimes(1);
  expect(spawnEnemies.mock.calls[0][0]).toHaveLength(8);
});
