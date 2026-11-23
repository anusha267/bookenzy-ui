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

test('sets a reading goal and shows progress', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Goal in books'), { target: { value: '5' } });
  fireEvent.submit(screen.getByRole('form', { name: /set reading goal/i }));
  const region = screen.getByRole('region', { name: /reading goal/i });
  expect(region).toHaveTextContent('1 of 5 books finished this year');
});

test('updates the current page of a book being read', () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Current page of Project Hail Mary'), { target: { value: '200' } });
  fireEvent.submit(screen.getByRole('form', { name: /update current page for project hail mary/i }));
  expect(screen.getByLabelText('Current page of Project Hail Mary')).toHaveValue(200);
  expect(screen.getByRole('progressbar', { name: /page progress for project hail mary/i })).toHaveAttribute('aria-valuenow', '200');
});

test('reports undated finished books separately from the yearly goal', () => {
  const year = new Date().getFullYear();
  window.localStorage.setItem('bookenzy.goal.v1', '5');
  window.localStorage.setItem(
    'bookenzy.books.v1',
    JSON.stringify([
      { id: 'b1', title: 'Old Finish', author: 'Ann', status: 'finished', rating: 4 },
      { id: 'b2', title: 'New Finish', author: 'Bob', status: 'finished', rating: 5, finishedAt: `${year}-05-01T10:00:00.000Z` },
    ])
  );
  render(<App />);
  const region = screen.getByRole('region', { name: /reading goal/i });
  expect(region).toHaveTextContent('1 of 5 books finished this year');
  expect(region).toHaveTextContent(`1 more finished, completion date unknown, not counted for ${year}`);
});

describe('signed-in mode', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  test('signing in loads the shelf from the API and saves new books there', async () => {
    const calls: string[] = [];
    global.fetch = jest.fn(async (url: any, init?: any) => {
      const u = String(url);
      calls.push(`${init?.method || 'GET'} ${u.replace(/^https?:\/\/[^/]+/, '')}`);
      const json = (body: any, status = 200) => ({ ok: status < 400, status, json: async () => body } as Response);
      if (u.includes('/v1/auth/login')) return json({ token: 't', userId: 'u1' });
      if (u.endsWith('/v1/shelf') && (init?.method || 'GET') === 'GET') {
        return json({ items: [{ id: 'a1', title: 'Server Book', author: 'Ann', status: 'reading', rating: 0, coverId: null, pages: null, year: null }] });
      }
      if (u.endsWith('/v1/shelf') && init?.method === 'POST') {
        return json({ id: 'a2', title: 'Dune', author: 'Frank Herbert', status: 'want', rating: 0, coverId: null, pages: null, year: null }, 201);
      }
      if (u.includes('openlibrary')) return json({ docs: [] });
      return json({}, 404);
    }) as any;

    render(<App />);
    userEvent.type(screen.getByLabelText('Username'), 'ada');
    userEvent.type(screen.getByLabelText('Password'), 'longenough1');
    fireEvent.submit(screen.getByRole('form', { name: /sign in/i }));

    expect(await screen.findByText('Server Book')).toBeInTheDocument();
    expect(screen.queryByText('Piranesi')).not.toBeInTheDocument();
    expect(screen.getByText(/signed in as/i)).toBeInTheDocument();

    userEvent.type(screen.getByLabelText('Title'), 'Dune');
    userEvent.type(screen.getByLabelText('Author'), 'Frank Herbert');
    fireEvent.submit(screen.getByRole('form', { name: /add a book/i }));
    expect(await screen.findByText('Dune')).toBeInTheDocument();
    expect(calls).toContain('POST /v1/shelf');
  });

  test('shows the server error when sign-in fails', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 401, json: async () => ({ error: 'Invalid username or password' }) } as Response)) as any;
    render(<App />);
    userEvent.type(screen.getByLabelText('Username'), 'ada');
    userEvent.type(screen.getByLabelText('Password'), 'wrongwrong');
    fireEvent.submit(screen.getByRole('form', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password');
    expect(screen.getByText('Piranesi')).toBeInTheDocument(); // still in demo mode
  });
});
