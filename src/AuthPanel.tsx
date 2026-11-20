import React, { useState } from 'react';
import { Session, login, register } from './api';

export default function AuthPanel({ onSignedIn }: { onSignedIn: (s: Session) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') await register(username.trim(), email.trim(), password);
      onSignedIn(await login(username.trim(), password));
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const input = 'rounded border border-slate-300 px-3 py-2 text-slate-800';
  return (
    <form onSubmit={submit} aria-label={mode === 'login' ? 'Sign in' : 'Create account'} className="mb-8 rounded-lg border border-indigo-200 bg-white p-4 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold">{mode === 'login' ? 'Sign in to sync your shelf' : 'Create an account'}</h2>
      <p className="mb-3 text-sm text-slate-500">
        Optional. Without an account the shelf stays in this browser. The server runs on a free tier, so the first request can take up to a minute.
      </p>
      <div className="flex flex-wrap gap-2">
        <input aria-label="Username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className={input} required />
        {mode === 'register' && (
          <input aria-label="Email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} required />
        )}
        <input aria-label="Password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} required minLength={8} />
        <button type="submit" disabled={busy} className="rounded bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-800 disabled:opacity-60">
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
        </button>
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="px-2 text-sm text-indigo-700 underline">
          {mode === 'login' ? 'Need an account?' : 'Have an account?'}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
