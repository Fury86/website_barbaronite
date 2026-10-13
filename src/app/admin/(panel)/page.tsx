import Link from "next/link";
import { count, desc, eq, isNull } from "drizzle-orm";
import { db, registrations, inquiries, auditLog, activities, posts } from "@/db";
import { getUpcomingEvents } from "@/lib/data";
import { formatDateTime, formatRange } from "@/lib/format";
import { FlashNotice } from "@/components/admin/client";
import { PageHeader } from "@/components/admin/page-header";
import { ACTION, ENTITY } from "@/lib/labels";

export default async function Dashboard() {
  const [regs, inqs, upcoming, log, [{ acts }], drafts] = await Promise.all([
    db.select().from(registrations).where(eq(registrations.status, "new")).orderBy(desc(registrations.createdAt)).limit(5),
    db.select().from(inquiries).where(eq(inquiries.status, "new")).orderBy(desc(inquiries.createdAt)).limit(5),
    getUpcomingEvents(5),
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(8),
    db.select({ acts: count() }).from(activities),
    db.select({ id: posts.id, title: posts.title }).from(posts).where(isNull(posts.publishedAt)).limit(5),
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader title="Табло" intro="Какво чака за обработка и какво предстои." />
      <FlashNotice />

      <div className="grid md:grid-cols-2 gap-6">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg">Нови записвания</h2>
            <Link href="/admin/registrations" className="text-sm font-bold text-plum hover:underline">Всички</Link>
          </div>
          {regs.length === 0 ? <p className="text-sm text-ink-soft">Няма необработени записвания.</p> : (
            <ul className="grid gap-2 text-sm">
              {regs.map((r) => (
                <li key={r.id} className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
                  <span><strong>{r.parentName}</strong> → {r.targetLabel}</span>
                  <span className="text-ink-soft whitespace-nowrap">{formatDateTime(r.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg">Нови запитвания</h2>
            <Link href="/admin/inquiries" className="text-sm font-bold text-plum hover:underline">Всички</Link>
          </div>
          {inqs.length === 0 ? <p className="text-sm text-ink-soft">Няма необработени запитвания.</p> : (
            <ul className="grid gap-2 text-sm">
              {inqs.map((q) => (
                <li key={q.id} className="border-b border-line pb-2 last:border-0">
                  <div className="flex justify-between gap-3"><strong>{q.name}</strong><span className="text-ink-soft whitespace-nowrap">{formatDateTime(q.createdAt)}</span></div>
                  <div className="text-ink-soft line-clamp-2">{q.message}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg">Предстоящи събития</h2>
            <Link href="/admin/events" className="text-sm font-bold text-plum hover:underline">Всички</Link>
          </div>
          {upcoming.length === 0 ? <p className="text-sm text-ink-soft">Няма предстоящи събития. <Link href="/admin/events/new" className="text-plum font-bold">Добавете</Link>.</p> : (
            <ul className="grid gap-2 text-sm">
              {upcoming.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
                  <Link href={`/admin/events/${e.id}`} className="font-bold hover:underline">{e.title}</Link>
                  <span className="text-ink-soft whitespace-nowrap">{formatRange(e.startsOn, e.endsOn)}</span>
                </li>
              ))}
            </ul>
          )}
          {drafts.length > 0 && (
            <p className="text-sm text-ink-soft mt-3">Чернови новини: {drafts.map((d, i) => <span key={d.id}>{i > 0 && ", "}<Link className="text-plum font-bold" href={`/admin/news/${d.id}`}>{d.title}</Link></span>)}</p>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg">Последни действия</h2>
            <span className="text-xs text-ink-soft">{acts} дейности в сайта</span>
          </div>
          <ul className="grid gap-1.5 text-sm">
            {log.map((l) => (
              <li key={l.id} className="flex gap-2 text-ink-soft">
                <span className="whitespace-nowrap">{formatDateTime(l.createdAt)}</span>
                <span className="text-ink"><strong>{l.userName || "—"}</strong> · {ACTION[l.action] ?? l.action} · {ENTITY[l.entity] ?? l.entity} {l.details && <span className="text-ink-soft">– {l.details}</span>}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

