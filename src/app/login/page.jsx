'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: signInError } = await authClient.signIn.email({ email, password });

      if (signInError) {
        setError(signInError.message || 'Authentication failed.');
        setIsLoading(false);
        return;
      }

      const { data: session } = await authClient.getSession();

      if (session?.user?.role !== 'admin') {
        await authClient.signOut();
        setError('Access denied — this panel is restricted to administrators.');
        setIsLoading(false);
        return;
      }

      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-inverse-surface px-4 py-16 text-on-surface">
      <section className="w-full max-w-[450px]">
        <div className="border border-outline-variant bg-surface p-10 shadow-2xl">
          <div className="mb-8 flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold tracking-tighter text-primary">
              TOOLIFY 3D
            </span>
            <span className="mt-1 font-spec-label text-xs uppercase tracking-widest text-secondary">
              // ADMIN_CONSOLE
            </span>
          </div>

          <h1 className="mb-8 font-headline-sm text-headline-sm font-bold">Restricted Access</h1>

          {error ? (
            <div className="mb-6 border-l-4 border-error bg-error/10 px-4 py-3 font-spec-label text-xs text-error">
              {error}
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-spec-label text-xs uppercase tracking-widest text-secondary"
              >
                [ EMAIL_ADDRESS ]
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@toolify3d.io"
                className="w-full border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface transition-all placeholder:text-outline focus:outline-2 focus:outline-primary focus:outline-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block font-spec-label text-xs uppercase tracking-widest text-secondary"
              >
                [ ACCESS_KEY ]
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-outline-variant bg-surface-container-lowest px-4 py-3 pr-12 font-body-md text-on-surface transition-all placeholder:text-outline focus:outline-2 focus:outline-primary focus:outline-offset-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary transition-colors hover:text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 bg-brand py-4 font-spec-label text-sm uppercase tracking-widest text-white transition-all duration-200 hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span>AUTHENTICATING...</span>
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-white/20 border-l-white"
                    aria-hidden
                  />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-spec-label text-[10px] uppercase tracking-widest text-outline">
          Authorized personnel only // Access is logged
        </p>
      </section>
    </main>
  );
}
