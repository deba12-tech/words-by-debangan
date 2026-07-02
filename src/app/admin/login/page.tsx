'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LockIcon, BookIcon } from '@/components/HandmadeIcons';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-sepia book-container-theme paper-texture flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-500 relative">
      <div className="absolute inset-4 md:inset-8 border border-current/5 rounded pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center text-secondary-theme">
          <BookIcon size={38} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold font-bengali text-primary-theme letterpress-ink">
          Words by Debangan
        </h2>
        <p className="mt-2 text-center text-xs tracking-widest text-secondary-theme/70 uppercase">
          Poet Registry Access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="card-theme py-8 px-4 shadow-xl sm:rounded border sm:px-10 relative">
          {/* Sewn margin decoration */}
          <div className="absolute left-6 top-6 bottom-6 ledger-stitch-line opacity-15 pointer-events-none" />
          
          <form className="space-y-6 pl-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-accent/5 border border-accent/20 text-accent p-3 rounded text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-secondary-theme/75">
                Register Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent focus:outline-none text-sm text-primary-theme font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-secondary-theme/75">
                Passphrase
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent focus:outline-none text-sm text-primary-theme font-sans"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-accent hover:bg-zinc-900 dark:hover:bg-amber-100 dark:hover:text-black text-amber-50 text-xs font-bold uppercase tracking-widest rounded shadow transition cursor-pointer disabled:opacity-50 border border-current/10"
              >
                <LockIcon size={12} />
                {loading ? 'Entering...' : 'Unlock Registry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
