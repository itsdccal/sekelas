export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar will be added in task 5.2 */}
      <div className="flex flex-1 flex-col">
        {/* Header will be added in task 5.1 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
