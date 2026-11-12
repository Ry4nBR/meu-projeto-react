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
    strokeRect: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    shadowColor: '',
    shadowBlur: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    globalAlpha: 1,
    save: jest.fn(),
    restore: jest.fn(),
    closePath: jest.fn(),
    fillText: jest.fn(),
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

test('pauses and resumes with P or the HUD button', () => {
  render(<App />);

  const pauseButton = screen.getByRole('button', { name: 'Pausar' });
  fireEvent.keyDown(window, { key: 'p' });

  expect(screen.getByText('Jogo pausado')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continuar' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Loja' })).toBeDisabled();

  fireEvent.keyDown(window, { key: 'ArrowUp' });
  expect(screen.getByLabelText('Área do jogo')).toHaveAttribute(
    'data-direction-y',
    '0',
  );

  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.queryByText('Jogo pausado')).not.toBeInTheDocument();
  expect(pauseButton).toHaveAttribute('aria-pressed', 'false');
});

test('pauses and resumes from the HUD button', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
  expect(screen.getByText('Jogo pausado')).toBeInTheDocument();

  fireEvent.keyDown(window, { key: 'P' });
  expect(screen.queryByText('Jogo pausado')).not.toBeInTheDocument();
});

test('renders party members on the canvas', () => {
  render(<App />);

  expect(canvasContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  expect(canvasContext.arc).toHaveBeenCalled();
  expect(canvasContext.fillRect).toHaveBeenCalled();
  expect(canvasContext.stroke).toHaveBeenCalled();
});

test('shows the party size and initial capacity in the game HUD', () => {
  render(<App />);

  expect(screen.getByText('Fila: 5/7')).toBeInTheDocument();
  expect(screen.getByText(/Inimigos restantes:/)).toBeInTheDocument();
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

test('renders party inspector panel and opens thematic class guide modal', () => {
  render(<App />);

  expect(screen.getByRole('complementary', { name: 'Painel da Fila' })).toBeInTheDocument();
  expect(screen.getByText('Painel da Fila')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Guia' }));
  expect(screen.getByRole('dialog', { name: '🏰 Guia de Classes & Arcade' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Entendido / Jogar' }));
  expect(screen.queryByRole('dialog', { name: '🏰 Guia de Classes & Arcade' })).not.toBeInTheDocument();
});
