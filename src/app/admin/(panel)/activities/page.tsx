import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, activities, teamMembers } from "@/db";
import { deleteActivityAction } from "@/actions/content";
import { DeleteButton, FlashNotice } from "@/components/admin/client";
import { Empty, PageHeader } from "@/components/admin/page-header";
import { cld } from "@/lib/cloudinary";

export default async function ActivitiesAdmin() {
  const rows = await db
    .select({ a: activities, teacher: teamMembers.name })
    .from(activities)
    .leftJoin(teamMembers, eq(activities.teacherId, teamMembers.id))
    .orderBy(asc(activities.sortOrder), asc(activities.id));

  return (
    <div className="grid gap-5">
      <PageHeader title="Дейности" intro="Курсовете, които се показват на сайта. Подредбата се определя от полето „Подредба“." action={{ href: "/admin/activities/new", label: "+ Нова дейност" }} />
      <FlashNotice />
      {rows.length === 0 ? <Empty>Няма дейности. Добавете първата.</Empty> : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead><tr><th>#</th><th>Дейност</th><th>Преподавател</th><th>Възраст</th><th>Статус</th><th></th></tr></thead>
            <tbody>
              {rows.map(({ a, teacher }) => (
                <tr key={a.id}>
                  <td className="text-ink-soft">{a.sortOrder}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center" style={{ background: a.color + "22" }}>
                        {a.imageUrl ? <img src={cld(a.imageUrl, 80)} alt="" className="w-8 h-8 object-contain" /> : <span className="w-4 h-4 rounded-full" style={{ background: a.color }} />}
                      </span>
                      <div>
                        <Link href={`/admin/activities/${a.id}`} className="font-extrabold hover:underline">{a.name}</Link>
                        <div className="text-xs text-ink-soft">/deynosti/{a.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{teacher ?? <span className="text-ink-soft">—</span>}</td>
                  <td>{a.ages || "—"}</td>
                  <td>
                    <span className={`badge ${a.visible ? "bg-mint/20 text-[#1c7a63]" : "bg-line text-ink-soft"}`}>{a.visible ? "Видима" : "Скрита"}</span>
                    {!a.allowRegistration && <span className="badge bg-line text-ink-soft ml-1">без записване</span>}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <Link href={`/admin/activities/${a.id}`} className="btn btn-ghost btn-sm">Редакция</Link>
                    <DeleteButton action={deleteActivityAction.bind(null, a.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
