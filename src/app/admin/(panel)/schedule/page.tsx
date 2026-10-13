import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db, scheduleSeasons, scheduleSlots } from "@/db";
import { activateSeasonAction, deleteSeasonAction } from "@/actions/schedule-events-news";
import { ActionButton, DeleteButton, FlashNotice } from "@/components/admin/client";
import { Empty, PageHeader } from "@/components/admin/page-header";

export default async function ScheduleAdmin() {
  const seasons = await db
    .select({ s: scheduleSeasons, slots: count(scheduleSlots.id) })
    .from(scheduleSeasons)
    .leftJoin(scheduleSlots, eq(scheduleSlots.seasonId, scheduleSeasons.id))
    .groupBy(scheduleSeasons.id)
    .orderBy(desc(scheduleSeasons.active), desc(scheduleSeasons.id));

  return (
    <div className="grid gap-5">
      <PageHeader title="Програма" intro="Графикът е организиран по сезони (напр. „Есен 2026“). На сайта се показва само активният сезон – така подготвяте следващия предварително." action={{ href: "/admin/schedule/new", label: "+ Нов сезон" }} />
      <FlashNotice />
      {seasons.length === 0 ? <Empty>Няма сезони. Създайте първия и добавете занимания.</Empty> : (
        <div className="grid gap-3">
          {seasons.map(({ s, slots }) => (
            <div key={s.id} className="card p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/schedule/${s.id}`} className="font-extrabold text-lg hover:underline">{s.name}</Link>
                  {s.active && <span className="badge bg-mint/20 text-[#1c7a63]">Активен – на сайта</span>}
                </div>
                <div className="text-sm text-ink-soft">{slots} занимания{s.note ? ` · ${s.note}` : ""}</div>
              </div>
              <Link href={`/admin/schedule/${s.id}`} className="btn btn-primary btn-sm">Занимания</Link>
              <Link href={`/admin/schedule/edit/${s.id}`} className="btn btn-ghost btn-sm">Редакция</Link>
              {!s.active && <ActionButton action={activateSeasonAction.bind(null, s.id)}>Активирай</ActionButton>}
              <DeleteButton action={deleteSeasonAction.bind(null, s.id)} confirmText="Ще изтриете сезона и всичките му занимания. Сигурни ли сте?" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
