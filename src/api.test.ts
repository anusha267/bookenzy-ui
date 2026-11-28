import { vi } from 'vitest';
import { ApiError, createItem, deleteItem, fetchShelf, login, patchItem, register } from './api';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const reply = (body: any, status = 200) => ({ ok: status < 400, status, json: async () => body } as Response);
const mockFetch = (fn: (url: string, init: any) => Response | Promise<Response>) => {
  const m = vi.fn(async (url: any, init?: any) => fn(String(url), init));
  globalThis.fetch = m as any;
  return m;
};

test('login posts credentials and returns a session', async () => {
  const f = mockFetch(() => reply({ token: 'tok' }));
  expect(await login('ada', 'pw12345678')).toEqual({ token: 'tok', username: 'ada' });
  const [url, init] = f.mock.calls[0] as any[];
  expect(url).toMatch(/\/v1\/auth\/login$/);
  expect(init.method).toBe('POST');
  expect(JSON.parse(init.body)).toEqual({ username: 'ada', password: 'pw12345678' });
  expect(init.headers.Authorization).toBeUndefined();
});

test('register posts username, email and password', async () => {
  const f = mockFetch(() => reply({ userId: 'u' }, 201));
  await register('ada', 'ada@example.com', 'pw12345678');
  expect(JSON.parse((f.mock.calls[0] as any[])[1].body)).toEqual({ username: 'ada', email: 'ada@example.com', password: 'pw12345678' });
});

test('authenticated calls send the bearer token', async () => {
  const f = mockFetch(() => reply({ items: [] }));
  await fetchShelf('secret-token');
  expect((f.mock.calls[0] as any[])[1].headers.Authorization).toBe('Bearer secret-token');
});

test('fetchShelf maps nulls to undefined and keeps finishedAt', async () => {
  mockFetch(() =>
    reply({ items: [{ id: '1', title: 'T', author: 'A', status: 'finished', rating: 4, coverId: null, pages: 100, year: null, currentPage: 0, finishedAt: '2026-01-01T00:00:00.000Z' }] })
  );
  const [b] = await fetchShelf('t');
  expect(b).toMatchObject({ id: '1', pages: 100, currentPage: 0, finishedAt: '2026-01-01T00:00:00.000Z' });
  expect(b.coverId).toBeUndefined();
  expect(b.year).toBeUndefined();
});

test('createItem posts the book and returns the stored one', async () => {
  const f = mockFetch(() => reply({ id: 'n1', title: 'Dune', author: 'FH', status: 'want', rating: 0 }, 201));
  const b = await createItem('t', { title: 'Dune', author: 'FH', status: 'want', rating: 0 });
  expect(b.id).toBe('n1');
  expect((f.mock.calls[0] as any[])[1].method).toBe('POST');
});

test('patchItem sends only a PATCH to the item URL', async () => {
  const f = mockFetch(() => reply({ id: 'n1', title: 'Dune', author: 'FH', status: 'reading', rating: 0, currentPage: 10 }));
  const b = await patchItem('t', 'n1', { currentPage: 10 });
  expect(b.currentPage).toBe(10);
  const [url, init] = f.mock.calls[0] as any[];
  expect(url).toMatch(/\/v1\/shelf\/n1$/);
  expect(init.method).toBe('PATCH');
});

test('deleteItem resolves on 204 with no body', async () => {
  mockFetch(() => ({ ok: true, status: 204, json: async () => { throw new Error('no body'); } } as unknown as Response));
  await expect(deleteItem('t', 'n1')).resolves.toBeUndefined();
});

test('server error message becomes ApiError with its status', async () => {
  mockFetch(() => reply({ error: 'Invalid username or password' }, 401));
  await expect(login('a', 'b')).rejects.toMatchObject({ message: 'Invalid username or password', status: 401 });
  await expect(login('a', 'b')).rejects.toBeInstanceOf(ApiError);
});

test('non-JSON error response falls back to a generic message', async () => {
  mockFetch(() => ({ ok: false, status: 502, json: async () => { throw new Error('html'); } } as unknown as Response));
  await expect(fetchShelf('t')).rejects.toMatchObject({ message: 'Request failed (502)', status: 502 });
});

test('network failure becomes a friendly ApiError with status 0', async () => {
  mockFetch(() => { throw new TypeError('Failed to fetch'); });
  await expect(fetchShelf('t')).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/could not reach the server/i) });
});
