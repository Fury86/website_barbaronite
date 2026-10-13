import Link from "next/link";

export const dynamic = "force-static";
export const metadata = { title: "Панел – нужна е база данни", robots: { index: false, follow: false } };

/** Показва се вместо панела, докато DATABASE_URL не е зададен във Vercel. Сайтът работи и без това. */
export default function DbSetupPage() {
  return (
    <main className="min-h-screen bg-admin-bg flex items-center justify-center p-6">
      <div className="w-full max-w-xl card p-8 grid gap-4">
        <div className="display text-2xl">БарбарониТЕ · Администрация</div>
        <p className="font-bold">Панелът още не е активен – проектът няма свързана база данни.</p>
        <p className="text-sm text-ink-soft">
          Сайтът вече работи с началното съдържание. За да се включи панелът (и да можете да редактирате съдържанието), направете следното във Vercel:
        </p>
        <ol className="list-decimal pl-5 grid gap-2 text-sm">
          <li><strong>Storage → Create Database → Neon</strong> → регион <strong>Frankfurt</strong> → <em>Connect to project</em> (всички среди).</li>
          <li><strong>Settings → Environment Variables</strong> → добавете <code>AUTH_SECRET</code> (дълъг случаен низ) и ключовете за Cloudinary (вижте README).</li>
          <li><strong>Deployments → Redeploy</strong> на последния deploy.</li>
          <li>След това отворете отново <code>/admin/setup</code>, за да създадете първия администратор.</li>
        </ol>
        <Link href="/" className="btn btn-ink btn-sm justify-self-start">Към сайта</Link>
      </div>
    </main>
  );
}
