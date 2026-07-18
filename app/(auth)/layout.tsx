export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-50" aria-label="Halaman autentikasi">
      {children}
    </main>
  );
}
