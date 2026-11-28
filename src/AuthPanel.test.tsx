import { vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPanel from './AuthPanel';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});
const reply = (body: any, status = 200) => ({ ok: status < 400, status, json: async () => body } as Response);

test('switches to register mode and shows the email field', () => {
  render(<AuthPanel onSignedIn={() => {}} />);
  expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /need an account/i }));
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByRole('form', { name: /create account/i })).toBeInTheDocument();
});

test('register then login, trimming the username, and reports the session', async () => {
  const calls: string[] = [];
  globalThis.fetch = vi.fn(async (url: any) => {
    calls.push(String(url).replace(/^https?:\/\/[^/]+/, ''));
    return String(url).includes('register') ? reply({ userId: 'u' }, 201) : reply({ token: 't' });
  }) as any;
  const onSignedIn = vi.fn();
  render(<AuthPanel onSignedIn={onSignedIn} />);
  fireEvent.click(screen.getByRole('button', { name: /need an account/i }));
  userEvent.type(screen.getByLabelText('Username'), '  ada ');
  userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
  userEvent.type(screen.getByLabelText('Password'), 'longenough1');
  fireEvent.submit(screen.getByRole('form', { name: /create account/i }));
  await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith({ token: 't', username: 'ada' }));
  expect(calls).toEqual(['/v1/auth/register', '/v1/auth/login']);
});

test('shows the error and does not sign in when registration fails', async () => {
  globalThis.fetch = vi.fn(async () => reply({ error: 'Username already in use' }, 400)) as any;
  const onSignedIn = vi.fn();
  render(<AuthPanel onSignedIn={onSignedIn} />);
  fireEvent.click(screen.getByRole('button', { name: /need an account/i }));
  userEvent.type(screen.getByLabelText('Username'), 'ada');
  userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
  userEvent.type(screen.getByLabelText('Password'), 'longenough1');
  fireEvent.submit(screen.getByRole('form', { name: /create account/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Username already in use');
  expect(onSignedIn).not.toHaveBeenCalled();
});

test('password field requires at least 8 characters', () => {
  render(<AuthPanel onSignedIn={() => {}} />);
  expect(screen.getByLabelText('Password')).toHaveAttribute('minlength', '8');
});
