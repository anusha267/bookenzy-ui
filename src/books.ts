export type Status = 'want' | 'reading' | 'finished';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: Status;
  rating: number; // 0 = not rated, 1-5
  coverId?: number; // Open Library cover id
  pages?: number;
  year?: number;
}

export const STORAGE_KEY = 'bookenzy.books.v1';

export const STATUS_LABELS: Record<Status, string> = {
  want: 'Want to read',
  reading: 'Reading',
  finished: 'Finished',
};

export const SAMPLE_BOOKS: Book[] = [
  { id: 'sample-1', title: 'The Hobbit', author: 'J.R.R. Tolkien', status: 'finished', rating: 5, pages: 310 },
  { id: 'sample-2', title: 'Project Hail Mary', author: 'Andy Weir', status: 'reading', rating: 0, pages: 476 },
  { id: 'sample-3', title: 'Piranesi', author: 'Susanna Clarke', status: 'want', rating: 0, pages: 272 },
];

export function loadBooks(): Book[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return SAMPLE_BOOKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Book[]) : SAMPLE_BOOKS;
  } catch {
    return SAMPLE_BOOKS;
  }
}

export function saveBooks(books: Book[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {
    // storage unavailable (private mode): the shelf still works for this session
  }
}

export interface Stats {
  total: number;
  finished: number;
  pagesRead: number;
  averageRating: number | null;
}

export function computeStats(books: Book[]): Stats {
  const finished = books.filter((b) => b.status === 'finished');
  const rated = books.filter((b) => b.rating > 0);
  return {
    total: books.length,
    finished: finished.length,
    pagesRead: finished.reduce((sum, b) => sum + (b.pages || 0), 0),
    averageRating: rated.length ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length : null,
  };
}

export function matchesQuery(book: Book, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
}
