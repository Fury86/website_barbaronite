import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { db, registrations, inquiries } from "@/db";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { AdminNav } from "@/components/admin/nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Панел – БарбарониТЕ", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [[{ newRegs }], [{ newInq }]] = await Promise.all([
    db.select({ newRegs: count() }).from(registrations).where(eq(registrations.status, "new")),
    db.select({ newInq: count() }).from(inquiries).where(and(eq(inquiries.status, "new"))),
  ]);
  return (
    <div className="min-h-screen bg-admin-bg lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="bg-white border-b lg:border-b-0 lg:border-r border-line p-4 lg:p-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="mb-4">
          <Link href="/admin" className="display text-xl block">БарбарониТЕ</Link>
          <Link href="/" target="_blank" className="text-xs font-bold text-plum hover:underline">Виж сайта ↗</Link>
        </div>
        <AdminNav role={user.role} badges={{ "/admin/registrations": newRegs, "/admin/inquiries": newInq }} />
        <div className="mt-6 pt-4 border-t border-line text-sm">
          <div className="font-extrabold truncate">{user.name}</div>
          <div className="text-ink-soft text-xs mb-2">{user.role === "admin" ? "Администратор" : "Редактор"}</div>
          <form action={logoutAction}>
            <button className="btn btn-ghost btn-sm -ml-3">Изход</button>
          </form>
        </div>
      </aside>
      <main className="p-4 md:p-8 max-w-6xl w-full">{children}</main>
    </div>
  );
}
