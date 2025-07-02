import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders sidebar, canvas, and results panel', () => {
  render(<App />);
  expect(screen.getByText(/Équipements/i)).toBeInTheDocument();
  expect(screen.getByText(/Résultats/i)).toBeInTheDocument();
  expect(screen.getByText(/Configuration/i)).toBeInTheDocument();
});