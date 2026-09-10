import { desc } from "drizzle-orm";
import { db, auditLog } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { ACTION, ENTITY } from "@/lib/labels";
import { PageHeader } from "@/components/admin/page-header";

export default async function LogPage() {
  await requireUser("admin");
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(300);
  return (
    <div className="grid gap-5">
      <PageHeader title="Дневник" intro="Кой какво е променил – последните 300 действия." />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Кога</th><th>Кой</th><th>Действие</th><th>Какво</th><th>Детайли</th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap text-ink-soft">{formatDateTime(l.createdAt)}</td>
                <td className="font-bold">{l.userName || "—"}</td>
                <td>{ACTION[l.action] ?? l.action}</td>
                <td>{ENTITY[l.entity] ?? l.entity} {l.entityId && <span className="text-ink-soft">#{l.entityId}</span>}</td>
                <td className="text-ink-soft">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
