import { Book, Status } from './books';

// The free Render tier sleeps when idle, so the first request can take up to a minute.
export const API_URL = (import.meta.env.VITE_API_URL || 'https://bookenzy-backend.onrender.com').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('Could not reach the server. Try again in a moment.', 0);
  }
  if (res.status === 204) return undefined as T;
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body
  }
  if (!res.ok) throw new ApiError((body && body.error) || `Request failed (${res.status})`, res.status);
  return body as T;
}

export interface Session {
  token: string;
  username: string;
}

export async function register(username: string, email: string, password: string): Promise<void> {
  await request('/v1/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
}

export async function login(username: string, password: string): Promise<Session> {
  const data = await request<{ token: string }>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return { token: data.token, username };
}

const fromApi = (i: any): Book => ({
  id: i.id,
  title: i.title,
  author: i.author,
  status: i.status,
  rating: i.rating,
  coverId: i.coverId ?? undefined,
  pages: i.pages ?? undefined,
  year: i.year ?? undefined,
  currentPage: i.currentPage ?? undefined,
  finishedAt: i.finishedAt ?? null,
});

export async function fetchShelf(token: string): Promise<Book[]> {
  const data = await request<{ items: any[] }>('/v1/shelf', { token });
  return data.items.map(fromApi);
}

export async function createItem(token: string, b: Omit<Book, 'id'>): Promise<Book> {
  return fromApi(await request('/v1/shelf', { method: 'POST', token, body: JSON.stringify(b) }));
}

export async function patchItem(token: string, id: string, patch: { status?: Status; rating?: number; currentPage?: number }): Promise<Book> {
  return fromApi(await request(`/v1/shelf/${id}`, { method: 'PATCH', token, body: JSON.stringify(patch) }));
}

export async function deleteItem(token: string, id: string): Promise<void> {
  await request(`/v1/shelf/${id}`, { method: 'DELETE', token });
}
