'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { validateLogin } from '@/lib/utils/validation';

// --- Toast Popup Component ---
function Toast({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 motion-reduce:transition-none ${
        type === 'success'
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 cursor-pointer text-white/80 transition-colors hover:text-white"
        aria-label="Tutup notifikasi"
      >
        ×
      </button>
    </div>
  );
}

// --- Login Page ---
export default function LoginPage() {
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

    // Check result from store
    const { user, isAuthenticated, error } = useAuthStore.getState();

    if (isAuthenticated && user) {
      setToast({
        type: 'success',
        message: `Selamat datang, ${user.firstName}!`,
      });

      setTimeout(() => {
        if (user.role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/student/dashboard';
        }
      }, 1000);
    } else if (error) {
      setToast({ type: 'error', message: 'Email atau password salah' });
    }
  }

  return (
    <>
      {/* Toast Popup */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto w-full max-w-md">
        {/* Card container */}
        <div className="rounded-2xl border border-border/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl sm:p-10">
          {/* Logo + Branding */}
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logo-icon.png"
              alt="Sekelas"
              width={56}
              height={56}
              className="mb-4"
              priority
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Masuk ke Sekelas
            </h1>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
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
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm transition-all duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="nama@email.com"
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                aria-invalid={!!fieldErrors.email}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p
                  id="email-error"
                  className="text-xs text-red-600"
                  role="alert"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 pr-11 text-sm transition-all duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Masukkan password"
                  aria-describedby={
                    fieldErrors.password ? 'password-error' : undefined
                  }
                  aria-invalid={!!fieldErrors.password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p
                  id="password-error"
                  className="text-xs text-red-600"
                  role="alert"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full cursor-pointer rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          {/* Footer info */}
        </div>

        {/* Brand footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Sekelas. All rights reserved.
        </p>
      </div>
    </>
  );
}
