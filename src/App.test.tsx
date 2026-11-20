import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => window.localStorage.clear());

test('shows the three shelves with sample books', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /want to read/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /^reading/i })).toBeInTheDocument();
  expect(screen.getByText('The Hobbit')).toBeInTheDocument();
});

test('adds a book to the want-to-read shelf', () => {
  render(<App />);
  userEvent.type(screen.getByLabelText('Title'), 'Dune');
  userEvent.type(screen.getByLabelText('Author'), 'Frank Herbert');
  fireEvent.submit(screen.getByRole('form', { name: /add a book/i }));
  expect(screen.getByText('Dune')).toBeInTheDocument();
});

test('moves a book between shelves', () => {
  render(<App />);
  userEvent.selectOptions(screen.getByLabelText('Status of Piranesi'), 'finished');
  expect(screen.getByLabelText('Status of Piranesi')).toHaveValue('finished');
});

test('filters the shelf by title', () => {
  render(<App />);
  userEvent.type(screen.getByLabelText('Filter shelf'), 'hobbit');
  expect(screen.getByText('The Hobbit')).toBeInTheDocument();
  expect(screen.queryByText('Piranesi')).not.toBeInTheDocument();
});

test('shows reading stats', () => {
  render(<App />);
  const stats = screen.getByRole('region', { name: /reading stats/i });
  expect(stats).toHaveTextContent('Finished');
  expect(stats).toHaveTextContent('5.0');
});
