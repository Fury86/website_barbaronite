import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, inquiries } from "@/db";
import { formatDateTime } from "@/lib/format";
import { deleteInquiryAction, setInquiryStatusAction } from "@/actions/misc";
import { ActionButton, DeleteButton } from "@/components/admin/client";
import { Empty, PageHeader } from "@/components/admin/page-header";

export default async function InquiriesAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "" } = await searchParams;
  const q = db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(300);
  const rows = status === "new" || status === "handled" ? await q.where(eq(inquiries.status, status)) : await q;
  return (
    <div className="grid gap-5">
      <PageHeader title="Запитвания" intro="Съобщения от контактната форма. Маркирайте ги като обработени, след като отговорите." />
      <div className="flex flex-wrap gap-2">
        {[{ key: "", label: "Всички" }, { key: "new", label: "Нови" }, { key: "handled", label: "Обработени" }].map((f) => (
          <Link key={f.key} href={f.key ? `/admin/inquiries?status=${f.key}` : "/admin/inquiries"} className={`btn btn-sm ${status === f.key ? "btn-ink" : "btn-outline"}`}>{f.label}</Link>
        ))}
      </div>
      {rows.length === 0 ? <Empty>Няма запитвания.</Empty> : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="card p-4 grid gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`badge ${r.status === "new" ? "bg-coral/15 text-coral-deep" : "bg-mint/20 text-[#1c7a63]"}`}>{r.status === "new" ? "Ново" : "Обработено"}</span>
                <span className="font-extrabold">{r.name}</span>
                {r.phone && <a href={`tel:${r.phone}`} className="text-plum font-bold text-sm">{r.phone}</a>}
                {r.email && <a href={`mailto:${r.email}`} className="text-plum font-bold text-sm">{r.email}</a>}
                <span className="ml-auto text-sm text-ink-soft whitespace-nowrap">{formatDateTime(r.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{r.message}</p>
              <div className="flex gap-2">
                {r.status === "new" ? (
                  <ActionButton action={setInquiryStatusAction.bind(null, r.id, "handled")} className="btn btn-ink btn-sm">Маркирай като обработено</ActionButton>
                ) : (
                  <ActionButton action={setInquiryStatusAction.bind(null, r.id, "new")} className="btn btn-ghost btn-sm">Върни в „Нови“</ActionButton>
                )}
                <DeleteButton action={deleteInquiryAction.bind(null, r.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
