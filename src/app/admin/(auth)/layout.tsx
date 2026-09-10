export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-admin-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="display text-2xl">БарбарониТЕ</div>
          <div className="text-sm text-ink-soft font-bold">Администрация</div>
        </div>
        {children}
      </div>
    </main>
  );
}
