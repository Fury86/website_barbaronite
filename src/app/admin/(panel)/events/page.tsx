import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, events, type Event } from "@/db";
import { isEventPast } from "@/lib/data";
import { formatRange } from "@/lib/format";
import { archiveEventAction, deleteEventAction } from "@/actions/schedule-events-news";
import { ActionButton, DeleteButton, FlashNotice } from "@/components/admin/client";
import { Empty, PageHeader } from "@/components/admin/page-header";

export default async function EventsAdmin() {
  const rows = await db.select().from(events).orderBy(desc(events.startsOn));
  const upcoming = rows.filter((e) => !isEventPast(e));
  const past = rows.filter((e) => isEventPast(e));

  return (
    <div className="grid gap-5">
      <PageHeader title="Събития" intro="Събитията минават в „Отминали“ автоматично след крайната си дата. Можете и ръчно да ги архивирате по-рано." action={{ href: "/admin/events/new", label: "+ Ново събитие" }} />
      <FlashNotice />
      <h2 className="text-lg">Предстоящи ({upcoming.length})</h2>
      {upcoming.length === 0 ? <Empty>Няма предстоящи събития.</Empty> : <EventsTable list={upcoming} pastList={false} />}
      <h2 className="text-lg mt-2">Отминали и архивирани ({past.length})</h2>
      {past.length === 0 ? <Empty>Архивът е празен.</Empty> : <EventsTable list={past} pastList />}
    </div>
  );
}

function EventsTable({ list, pastList }: { list: Event[]; pastList: boolean }) {
  return (
    <div className="card overflow-x-auto">
      <table className="table">
        <thead><tr><th>Събитие</th><th>Дата</th><th>Статус</th><th></th></tr></thead>
        <tbody>
          {list.map((e) => (
            <tr key={e.id}>
              <td>
                <Link href={`/admin/events/${e.id}`} className="font-extrabold hover:underline">{e.title}</Link>
                <div className="text-xs text-ink-soft">/sabitiya/{e.slug}</div>
              </td>
              <td className="whitespace-nowrap">{formatRange(e.startsOn, e.endsOn)}</td>
              <td>
                {!e.visible && <span className="badge bg-line text-ink-soft mr-1">Скрито</span>}
                {e.archived ? <span className="badge bg-line text-ink-soft">Архивирано ръчно</span> : pastList ? <span className="badge bg-line text-ink-soft">Отминало</span> : <span className="badge bg-mint/20 text-[#1c7a63]">Предстоящо</span>}
                {e.registrationOpen && !pastList && <span className="badge bg-sun/30 ml-1">записване</span>}
              </td>
              <td className="text-right whitespace-nowrap">
                <Link href={`/admin/events/${e.id}`} className="btn btn-ghost btn-sm">Редакция</Link>
                {e.archived ? (
                  <ActionButton action={archiveEventAction.bind(null, e.id, false)} className="btn btn-ghost btn-sm">Върни от архива</ActionButton>
                ) : !pastList ? (
                  <ActionButton action={archiveEventAction.bind(null, e.id, true)} className="btn btn-ghost btn-sm">Архивирай</ActionButton>
                ) : null}
                <DeleteButton action={deleteEventAction.bind(null, e.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
