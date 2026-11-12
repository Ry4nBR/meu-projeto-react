import { act, render } from '@testing-library/react';
import { useGameLoop } from './useGameLoop';

function GameLoopHarness({ onFrame, enabled }) {
  useGameLoop(onFrame, enabled);
  return null;
}

test('runs at up to 60 FPS and passes deltaTime in seconds', () => {
  let frameCallback;
  jest
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      frameCallback = callback;
      return 1;
    });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

  const onFrame = jest.fn();
  const { unmount } = render(<GameLoopHarness onFrame={onFrame} />);

  act(() => frameCallback(0));
  expect(onFrame).toHaveBeenCalledWith(0);

  act(() => frameCallback(8));
  expect(onFrame).toHaveBeenCalledTimes(1);

  act(() => frameCallback(1000 / 60));
  expect(onFrame).toHaveBeenCalledTimes(2);
  expect(onFrame.mock.calls[1][0]).toBeCloseTo(1 / 60, 4);

  unmount();
  jest.restoreAllMocks();
});

test('cancels the scheduled animation frame on unmount', () => {
  let frameCallback;
  jest
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      frameCallback = callback;
      return 12;
    });
  const cancelAnimationFrame = jest
    .spyOn(window, 'cancelAnimationFrame')
    .mockImplementation(() => {});

  const { unmount } = render(<GameLoopHarness onFrame={jest.fn()} />);
  act(() => frameCallback(0));

  unmount();

  expect(cancelAnimationFrame).toHaveBeenCalledWith(12);
  jest.restoreAllMocks();
});

test('stops scheduling frames after the loop is disabled', () => {
  let frameCallback;
  const requestAnimationFrame = jest
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      frameCallback = callback;
      return 12;
    });
  const cancelAnimationFrame = jest
    .spyOn(window, 'cancelAnimationFrame')
    .mockImplementation(() => {});
  const onFrame = jest.fn();
  const { rerender } = render(
    <GameLoopHarness onFrame={onFrame} enabled />,
  );

  act(() => frameCallback(0));
  const scheduledCallback = frameCallback;
  rerender(<GameLoopHarness onFrame={onFrame} enabled={false} />);
  const requestCountAfterDisable = requestAnimationFrame.mock.calls.length;

  act(() => scheduledCallback(20));

  expect(cancelAnimationFrame).toHaveBeenCalledWith(12);
  expect(requestAnimationFrame).toHaveBeenCalledTimes(requestCountAfterDisable);
  expect(onFrame).toHaveBeenCalledTimes(1);
  jest.restoreAllMocks();
});

test('does not schedule frames while disabled', () => {
  const requestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
  const cancelAnimationFrame = jest.spyOn(window, 'cancelAnimationFrame');

  const { unmount } = render(
    <GameLoopHarness onFrame={jest.fn()} enabled={false} />,
  );

  expect(requestAnimationFrame).not.toHaveBeenCalled();
  unmount();
  expect(cancelAnimationFrame).not.toHaveBeenCalled();
  jest.restoreAllMocks();
});
