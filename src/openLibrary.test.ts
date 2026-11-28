import { vi } from 'vitest';
import { coverUrl, searchBooks } from './openLibrary';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

test('short queries do not hit the network', async () => {
  const f = vi.fn();
  globalThis.fetch = f as any;
  expect(await searchBooks('  a ')).toEqual([]);
  expect(f).not.toHaveBeenCalled();
});

test('maps Open Library docs and encodes the query', async () => {
  const f = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ docs: [{ key: '/works/1', title: 'Dune', author_name: ['Frank Herbert'], cover_i: 7, first_publish_year: 1965, number_of_pages_median: 412 }, { key: '/works/2', title: 'No Author' }] }),
  }));
  globalThis.fetch = f as any;
  const r = await searchBooks('dune & more');
  expect(String((f.mock.calls[0] as any[])[0])).toContain('q=dune%20%26%20more');
  expect(r[0]).toEqual({ key: '/works/1', title: 'Dune', author: 'Frank Herbert', coverId: 7, year: 1965, pages: 412 });
  expect(r[1].author).toBe('Unknown author');
});

test('throws when Open Library responds with an error', async () => {
  globalThis.fetch = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })) as any;
  await expect(searchBooks('dune')).rejects.toThrow('Open Library returned 503');
});

test('coverUrl points at the medium cover', () => {
  expect(coverUrl(42)).toBe('https://covers.openlibrary.org/b/id/42-M.jpg');
});
