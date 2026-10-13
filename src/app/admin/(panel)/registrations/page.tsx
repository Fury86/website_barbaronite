import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, registrations } from "@/db";
import { formatDateTime } from "@/lib/format";
import { REG_STATUS } from "@/lib/labels";
import { deleteRegistrationAction, updateRegistrationAction } from "@/actions/misc";
import { DeleteButton } from "@/components/admin/client";
import { Empty, PageHeader } from "@/components/admin/page-header";

const FILTERS = [
  { key: "", label: "Всички" },
  { key: "new", label: "Нови" },
  { key: "confirmed", label: "Потвърдени" },
  { key: "declined", label: "Отказани" },
];

export default async function RegistrationsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "" } = await searchParams;
  const q = db.select().from(registrations).orderBy(desc(registrations.createdAt)).limit(300);
  const rows = ["new", "confirmed", "declined"].includes(status)
    ? await q.where(eq(registrations.status, status as "new" | "confirmed" | "declined"))
    : await q;

  return (
    <div className="grid gap-5">
      <PageHeader title="Записвания" intro="Заявки от формата за записване. Сменете статуса, след като се свържете с родителя." action={{ href: "/api/export/registrations", label: "Изтегли CSV" }} />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key ? `/admin/registrations?status=${f.key}` : "/admin/registrations"} className={`btn btn-sm ${status === f.key ? "btn-ink" : "btn-outline"}`}>{f.label}</Link>
        ))}
      </div>
      {rows.length === 0 ? <Empty>Няма записвания{status ? " с този статус" : ""}.</Empty> : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <details key={r.id} className="card p-4" open={r.status === "new"}>
              <summary className="cursor-pointer list-none flex flex-wrap items-center gap-3">
                <span className={`badge ${REG_STATUS[r.status].cls}`}>{REG_STATUS[r.status].label}</span>
                <span className="font-extrabold">{r.parentName}</span>
                <span className="text-ink-soft">→ {r.targetLabel}</span>
                <span className="ml-auto text-sm text-ink-soft whitespace-nowrap">{formatDateTime(r.createdAt)}</span>
              </summary>
              <div className="mt-4 grid md:grid-cols-[1fr_320px] gap-5 text-sm">
                <dl className="grid grid-cols-[120px_1fr] gap-y-1.5">
                  <dt className="text-ink-soft">Дете</dt><dd>{r.childName || "—"}{r.childAge && ` (${r.childAge})`}</dd>
                  <dt className="text-ink-soft">Телефон</dt><dd><a href={`tel:${r.phone}`} className="font-bold text-plum">{r.phone}</a></dd>
                  <dt className="text-ink-soft">Имейл</dt><dd>{r.email ? <a href={`mailto:${r.email}`} className="font-bold text-plum">{r.email}</a> : "—"}</dd>
                  <dt className="text-ink-soft">Бележка</dt><dd className="whitespace-pre-wrap">{r.message || "—"}</dd>
                </dl>
                <form action={updateRegistrationAction} className="grid gap-2 content-start">
                  <input type="hidden" name="id" value={r.id} />
                  <label className="field"><span className="font-bold">Статус</span>
                    <select name="status" defaultValue={r.status} className="select">
                      <option value="new">Ново</option><option value="confirmed">Потвърдено</option><option value="declined">Отказано</option>
                    </select>
                  </label>
                  <label className="field"><span className="font-bold">Вътрешна бележка</span>
                    <textarea name="adminNote" defaultValue={r.adminNote} className="textarea" rows={2} style={{ minHeight: "3.5rem" }} />
                  </label>
                  <div className="flex gap-2">
                    <button className="btn btn-ink btn-sm">Запази</button>
                    <DeleteButton action={deleteRegistrationAction.bind(null, r.id)} />
                  </div>
                </form>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
