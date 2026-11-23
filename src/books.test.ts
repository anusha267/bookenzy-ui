import { computeGoalProgress, computeStats, countUndatedFinished, matchesQuery, Book } from './books';

const mk = (o: Partial<Book>): Book => ({ id: 'x', title: 'T', author: 'A', status: 'want', rating: 0, ...o });

test('computeStats counts finished books, pages and average rating', () => {
  const s = computeStats([
    mk({ status: 'finished', pages: 300, rating: 4 }),
    mk({ status: 'finished', pages: 100, rating: 2 }),
    mk({ status: 'reading', pages: 999 }),
  ]);
  expect(s).toEqual({ total: 3, finished: 2, pagesRead: 400, averageRating: 3 });
});

test('computeStats has no average when nothing is rated', () => {
  expect(computeStats([mk({})]).averageRating).toBeNull();
});

test('matchesQuery is case-insensitive on title and author', () => {
  expect(matchesQuery(mk({ title: 'Dune', author: 'Frank Herbert' }), 'herbert')).toBe(true);
  expect(matchesQuery(mk({ title: 'Dune' }), 'xyz')).toBe(false);
});

test('computeGoalProgress counts only books finished in the given year', () => {
  const books = [
    mk({ status: 'finished', finishedAt: '2026-03-01T00:00:00.000Z' }),
    mk({ status: 'finished', finishedAt: '2025-12-31T23:00:00.000Z' }),
    mk({ status: 'finished' }), // no date: must not silently claim this year
    mk({ status: 'reading' }),
  ];
  expect(computeGoalProgress(books, 2026)).toBe(1);
  expect(computeGoalProgress(books, 2025)).toBe(1);
});

test('countUndatedFinished counts finished books with no completion date', () => {
  const books = [
    mk({ status: 'finished', finishedAt: '2026-03-01T00:00:00.000Z' }),
    mk({ status: 'finished' }),
    mk({ status: 'reading' }),
  ];
  expect(countUndatedFinished(books)).toBe(1);
  expect(countUndatedFinished([])).toBe(0);
});
