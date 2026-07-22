export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 py-8"
      aria-label="Halaman autentikasi"
    >
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary-300/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-48 w-48 -translate-x-1/2 rounded-full bg-primary-100/40 blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </main>
  );
}
