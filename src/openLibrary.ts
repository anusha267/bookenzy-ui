export interface SearchResult {
  key: string;
  title: string;
  author: string;
  coverId?: number;
  year?: number;
  pages?: number;
}

const FIELDS = 'key,title,author_name,cover_i,first_publish_year,number_of_pages_median';

export async function searchBooks(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=${FIELDS}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Open Library returned ${res.status}`);
  const data = await res.json();
  return (data.docs || []).map((d: any) => ({
    key: d.key,
    title: d.title,
    author: (d.author_name && d.author_name[0]) || 'Unknown author',
    coverId: d.cover_i,
    year: d.first_publish_year,
    pages: d.number_of_pages_median,
  }));
}

export const coverUrl = (coverId: number) => `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
