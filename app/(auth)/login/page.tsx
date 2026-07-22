'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { validateLogin } from '@/lib/utils/validation';

// --- Toast Component (minimal, subtle) ---
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
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-lg border px-4 py-2.5 shadow-sm ${
        type === 'success'
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {type === 'success' ? (
        <Check className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      <span className="text-sm">{message}</span>
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
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Client-side validation
    const validation = validateLogin(email, password);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);

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
      setFormError('Email atau password salah');
      setToast({ type: 'error', message: 'Login gagal' });
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm sm:p-10">
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
            {/* Inline persistent error */}
            {formError && (
              <div
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}

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
                  setFormError(null);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }
                }}
                disabled={isLoading}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="nama@email.com"
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                aria-invalid={!!fieldErrors.email}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-xs text-red-600" role="alert">
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
                    setFormError(null);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }
                  }}
                  disabled={isLoading}
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 pr-11 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Masukkan password"
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  aria-invalid={!!fieldErrors.password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
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
                <p id="password-error" className="text-xs text-red-600" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full cursor-pointer rounded-lg text-sm font-semibold disabled:cursor-not-allowed"
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
        </div>

        {/* Brand footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Sekelas
        </p>
      </div>
    </>
  );
}
