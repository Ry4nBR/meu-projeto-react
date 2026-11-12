import { fireEvent, render, screen } from '@testing-library/react';
import ClassGuideModal from './ClassGuideModal';

test('renders the thematic class guide when open and can be closed', () => {
  const onClose = jest.fn();
  const { rerender } = render(<ClassGuideModal isOpen={true} onClose={onClose} />);

  expect(screen.getByRole('dialog', { name: '🏰 Guia de Classes & Arcade' })).toBeInTheDocument();
  expect(screen.getByText(/Guerreiro \(Líder\)/)).toBeInTheDocument();
  expect(screen.getByText(/Bruxa de Gelo/)).toBeInTheDocument();
  expect(screen.getByText(/Druida/)).toBeInTheDocument();
  expect(screen.getByText(/Mago de Vento/)).toBeInTheDocument();
  expect(screen.getByText(/Necromante/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Entendido / Jogar' }));
  expect(onClose).toHaveBeenCalledTimes(1);

  rerender(<ClassGuideModal isOpen={false} onClose={onClose} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
