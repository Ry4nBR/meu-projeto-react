import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the centered game canvas at 800 by 600 pixels', () => {
  render(<App />);

  const canvas = screen.getByLabelText('Área do jogo');
  expect(canvas).toHaveAttribute('width', '800');
  expect(canvas).toHaveAttribute('height', '600');
  expect(canvas.parentElement).toHaveClass('App');
});

test('updates the game direction from keyboard input', () => {
  render(<App />);

  const canvas = screen.getByLabelText('Área do jogo');
  fireEvent.keyDown(window, { key: 'ArrowUp' });

  expect(canvas).toHaveAttribute('data-direction-x', '0');
  expect(canvas).toHaveAttribute('data-direction-y', '-1');
});
