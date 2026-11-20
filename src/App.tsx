import React, { useEffect, useState } from 'react';
import { Book, Status, STATUS_LABELS, loadBooks, saveBooks } from './books';

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

  useEffect(() => saveBooks(books), [books]);

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

        <div className="grid gap-6 md:grid-cols-3">
          {STATUSES.map((s) => {
            const list = books.filter((b) => b.status === s);
            return (
              <section key={s} aria-label={STATUS_LABELS[s]}>
                <h2 className="mb-3 text-lg font-semibold">
                  {STATUS_LABELS[s]} <span className="text-slate-400">({list.length})</span>
                </h2>
                <ul className="space-y-3">
                  {list.length === 0 && <li className="text-sm text-slate-400">Nothing here yet.</li>}
                  {list.map((b) => (
                    <li key={b.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="font-medium">{b.title}</div>
                      <div className="mb-2 text-sm text-slate-500">{b.author}</div>
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
