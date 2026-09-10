import { desc } from "drizzle-orm";
import { db, registrations } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { REG_STATUS } from "@/lib/labels";

export const dynamic = "force-dynamic";

function csvCell(v: string): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

/** CSV на записванията (за Excel). Само за влезли потребители. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("unauthorized", { status: 401 });
  const rows = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  const header = ["Дата", "Статус", "За", "Родител", "Дете", "Възраст", "Телефон", "Имейл", "Бележка", "Вътрешна бележка"];
  const lines = rows.map((r) =>
    [formatDateTime(r.createdAt), REG_STATUS[r.status].label, r.targetLabel, r.parentName, r.childName, r.childAge, r.phone, r.email, r.message, r.adminNote].map(csvCell).join(";"),
  );
  const csv = "\uFEFF" + [header.map(csvCell).join(";"), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="zapisvaniya-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
