'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { validateLogin } from '@/lib/utils/validation';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Client-side validation
    const validation = validateLogin(email, password);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});

    await login(email, password);

    // After login, check the store for the user to redirect
    const { user, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-primary-800">
        Masuk ke Sekelas
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            maxLength={100}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }
            }}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
            placeholder="nama@email.com"
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            maxLength={64}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }
            }}
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
            placeholder="Minimal 8 karakter"
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Auth error (generic message from store) */}
        {authError && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {authError}
          </p>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </Button>
      </form>
    </div>
  );
}
