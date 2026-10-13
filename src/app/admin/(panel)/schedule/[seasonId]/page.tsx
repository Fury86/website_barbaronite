import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, scheduleSeasons } from "@/db";
import { getSeasonSlots } from "@/lib/data";
import { WEEKDAYS } from "@/lib/format";
import { deleteSlotAction } from "@/actions/schedule-events-news";
import { DeleteButton, FlashNotice } from "@/components/admin/client";
import { Empty, PageHeader } from "@/components/admin/page-header";

export default async function SeasonSlots({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const sid = Number(seasonId);
  const [season] = await db.select().from(scheduleSeasons).where(eq(scheduleSeasons.id, sid)).limit(1);
  if (!season) notFound();
  const slots = await getSeasonSlots(sid);
  const byDay = new Map<number, typeof slots>();
  for (const s of slots) byDay.set(s.weekday, [...(byDay.get(s.weekday) ?? []), s]);

  return (
    <div className="grid gap-5">
      <PageHeader title={`Програма · ${season.name}`} intro={season.active ? "Този сезон е активен – промените се виждат на сайта веднага." : "Сезонът не е активен – промените не се виждат на сайта, докато не го активирате."} action={{ href: `/admin/schedule/${sid}/new`, label: "+ Ново занимание" }} />
      <FlashNotice />
      <p className="text-sm"><Link href="/admin/schedule" className="text-plum font-bold hover:underline">← Всички сезони</Link></p>
      {slots.length === 0 ? <Empty>Няма занимания в този сезон.</Empty> : (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5, 6, 7].filter((d) => byDay.has(d)).map((d) => (
            <div key={d} className="card overflow-hidden">
              <div className="px-4 py-2 font-extrabold bg-paper-deep">{WEEKDAYS[d]}</div>
              <table className="table">
                <tbody>
                  {byDay.get(d)!.map((s) => (
                    <tr key={s.id}>
                      <td className="whitespace-nowrap font-bold w-32">{s.startTime}{s.endTime && ` – ${s.endTime}`}</td>
                      <td><span className="inline-block w-3 h-3 rounded-full mr-2 align-middle" style={{ background: s.color }} />{s.title}{s.groupLabel && <span className="text-ink-soft"> · {s.groupLabel}</span>}</td>
                      <td className="text-ink-soft">{s.teacher}{s.room && ` · ${s.room}`}</td>
                      <td className="text-right whitespace-nowrap">
                        <Link href={`/admin/schedule/${sid}/slot/${s.id}`} className="btn btn-ghost btn-sm">Редакция</Link>
                        <DeleteButton action={deleteSlotAction.bind(null, s.id, sid)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
