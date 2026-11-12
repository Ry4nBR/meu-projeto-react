import { fireEvent, render, screen } from '@testing-library/react';
import { usePlayerDirection } from './usePlayerDirection';

function DirectionHarness() {
  const direction = usePlayerDirection();
  return (
    <output aria-label="direction">
      {direction.x},{direction.y}
    </output>
  );
}

test('maps WASD and arrow keys to direction vectors', () => {
  render(<DirectionHarness />);

  expect(screen.getByLabelText('direction')).toHaveTextContent('1,0');

  fireEvent.keyDown(window, { key: 'ArrowUp' });
  expect(screen.getByLabelText('direction')).toHaveTextContent('0,-1');

  fireEvent.keyDown(window, { key: 'd' });
  expect(screen.getByLabelText('direction')).toHaveTextContent('1,0');

  fireEvent.keyDown(window, { key: 'S' });
  expect(screen.getByLabelText('direction')).toHaveTextContent('0,1');

  fireEvent.keyDown(window, { key: 'ArrowLeft' });
  expect(screen.getByLabelText('direction')).toHaveTextContent('-1,0');
});

test('ignores a direction that would reverse the current direction', () => {
  render(<DirectionHarness />);

  fireEvent.keyDown(window, { key: 'a' });
  expect(screen.getByLabelText('direction')).toHaveTextContent('1,0');

  fireEvent.keyDown(window, { key: 'ArrowUp' });
  fireEvent.keyDown(window, { key: 's' });
  expect(screen.getByLabelText('direction')).toHaveTextContent('0,-1');
});

test('removes the keyboard listener when the hook unmounts', () => {
  const removeEventListener = jest.spyOn(window, 'removeEventListener');
  const { unmount } = render(<DirectionHarness />);

  unmount();

  expect(removeEventListener).toHaveBeenCalledWith(
    'keydown',
    expect.any(Function),
  );
  removeEventListener.mockRestore();
});
