import React, { useEffect, useState } from 'react';
import { Book, Status, STATUS_LABELS, computeStats, loadBooks, matchesQuery, saveBooks } from './books';
import { SearchResult, coverUrl, searchBooks } from './openLibrary';

const STATUSES: Status[] = ['want', 'reading', 'finished'];

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div role="group" aria-label="Rating" className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-pressed={n <= value}
          onClick={() => onChange(n === value ? 0 : n)}
          className={n <= value ? 'text-amber-500' : 'text-slate-300'}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function App() {
  const [books, setBooks] = useState<Book[]>(loadBooks);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [filter, setFilter] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState('');

  useEffect(() => saveBooks(books), [books]);

  // Look books up on Open Library as the title is typed (debounced).
  useEffect(() => {
    if (title.trim().length < 3) {
      setResults([]);
      setSearchError('');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchBooks(title, controller.signal)
        .then((r) => {
          setResults(r);
          setSearchError('');
        })
        .catch((e) => {
          if (e.name !== 'AbortError') setSearchError('Book search is unavailable right now. You can still add books by hand.');
        });
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [title]);

  const addFromResult = (r: SearchResult) => {
    setBooks([
      ...books,
      { id: `${Date.now()}`, title: r.title, author: r.author, status: 'want', rating: 0, coverId: r.coverId, pages: r.pages, year: r.year },
    ]);
    setTitle('');
    setAuthor('');
    setResults([]);
  };

  const exportShelf = () => {
    const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bookenzy-shelf.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const stats = computeStats(books);

  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    setBooks([
      ...books,
      { id: `${Date.now()}`, title: title.trim(), author: author.trim(), status: 'want', rating: 0 },
    ]);
    setTitle('');
    setAuthor('');
  };

  const update = (id: string, patch: Partial<Book>) =>
    setBooks(books.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800">
      <header className="bg-indigo-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-3xl font-bold">Bookenzy</h1>
          <p className="text-indigo-100">Track what you want to read, what you are reading, and what you finished.</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <p className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          Demo mode: your shelf is saved in this browser only. Accounts and syncing with the Bookenzy API are
          not connected yet.
        </p>

        <form onSubmit={addBook} className="mb-8 flex flex-wrap gap-2" aria-label="Add a book">
          <input
            aria-label="Title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-w-[10rem] flex-1 rounded border border-slate-300 px-3 py-2"
          />
          <input
            aria-label="Author"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="min-w-[10rem] flex-1 rounded border border-slate-300 px-3 py-2"
          />
          <button type="submit" className="rounded bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-800">
            Add book
          </button>
        </form>

        {results.length > 0 && (
          <ul aria-label="Search results" className="-mt-5 mb-8 divide-y rounded border border-slate-200 bg-white shadow-sm">
            {results.map((r) => (
              <li key={r.key}>
                <button
                  type="button"
                  onClick={() => addFromResult(r)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-indigo-50"
                >
                  {r.coverId ? (
                    <img src={coverUrl(r.coverId)} alt="" className="h-12 w-8 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-8 rounded bg-slate-200" />
                  )}
                  <span>
                    <span className="font-medium">{r.title}</span>
                    <span className="block text-sm text-slate-500">
                      {r.author}
                      {r.year ? ` · ${r.year}` : ''}
                      {r.pages ? ` · ${r.pages} pages` : ''}
                    </span>
                  </span>
                  <span className="ml-auto text-sm text-indigo-700">Add</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {searchError && <p className="-mt-5 mb-6 text-sm text-slate-500">{searchError}</p>}

        <section aria-label="Reading stats" className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ['Books', String(stats.total)],
            ['Finished', String(stats.finished)],
            ['Pages read', stats.pagesRead.toLocaleString()],
            ['Average rating', stats.averageRating === null ? '-' : stats.averageRating.toFixed(1)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-indigo-700">{value}</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
            </div>
          ))}
        </section>

        <div className="mb-6 flex gap-2">
          <input
            aria-label="Filter shelf"
            placeholder="Filter your shelf by title or author"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-3 py-2"
          />
          <button type="button" onClick={exportShelf} className="rounded border border-indigo-700 px-4 py-2 text-indigo-700 hover:bg-indigo-50">
            Export JSON
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STATUSES.map((s) => {
            const list = books.filter((b) => b.status === s && matchesQuery(b, filter));
            return (
              <section key={s} aria-label={STATUS_LABELS[s]}>
                <h2 className="mb-3 text-lg font-semibold">
                  {STATUS_LABELS[s]} <span className="text-slate-400">({list.length})</span>
                </h2>
                <ul className="space-y-3">
                  {list.length === 0 && <li className="text-sm text-slate-400">Nothing here yet.</li>}
                  {list.map((b) => (
                    <li key={b.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="mb-2 flex gap-3">
                        {b.coverId && <img src={coverUrl(b.coverId)} alt="" loading="lazy" className="h-16 w-11 rounded object-cover" />}
                        <div>
                          <div className="font-medium">{b.title}</div>
                          <div className="text-sm text-slate-500">
                            {b.author}
                            {b.pages ? ` · ${b.pages} pages` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <select
                          aria-label={`Status of ${b.title}`}
                          value={b.status}
                          onChange={(e) => update(b.id, { status: e.target.value as Status })}
                          className="rounded border border-slate-300 px-1 py-0.5 text-sm"
                        >
                          {STATUSES.map((x) => (
                            <option key={x} value={x}>
                              {STATUS_LABELS[x]}
                            </option>
                          ))}
                        </select>
                        <Stars value={b.rating} onChange={(n) => update(b.id, { rating: n })} />
                        <button
                          type="button"
                          aria-label={`Remove ${b.title}`}
                          onClick={() => setBooks(books.filter((x) => x.id !== b.id))}
                          className="text-sm text-slate-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App;
