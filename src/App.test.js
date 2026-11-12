import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

let canvasContext;

beforeEach(() => {
  canvasContext = {
    arc: jest.fn(),
    beginPath: jest.fn(),
    clearRect: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
    lineTo: jest.fn(),
    moveTo: jest.fn(),
    stroke: jest.fn(),
  };
  jest
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(canvasContext);
});

afterEach(() => {
  jest.restoreAllMocks();
});

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

test('renders party members on the canvas', () => {
  render(<App />);

  expect(canvasContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  expect(canvasContext.arc).toHaveBeenCalledTimes(10);
  expect(canvasContext.fillRect).toHaveBeenCalledTimes(20);
  expect(canvasContext.stroke).toHaveBeenCalledTimes(1);
});

test('shows the party size and initial capacity in the game HUD', () => {
  render(<App />);

  expect(screen.getByText('Fila: 5/7')).toBeInTheDocument();
});

test('opens the slot upgrade shop and disables purchases without enough coins', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Loja' }));

  const shop = screen.getByRole('dialog', { name: 'Loja' });
  expect(shop).toHaveTextContent('+1 Slot de Fila — 50 moedas');
  expect(
    screen.getByRole('button', { name: 'Comprar +1 slot' }),
  ).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: 'Fechar loja' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
