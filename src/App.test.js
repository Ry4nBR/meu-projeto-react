import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the centered game canvas at 800 by 600 pixels', () => {
  render(<App />);

  const canvas = screen.getByLabelText('Área do jogo');
  expect(canvas).toHaveAttribute('width', '800');
  expect(canvas).toHaveAttribute('height', '600');
  expect(canvas.parentElement).toHaveClass('App');
});
