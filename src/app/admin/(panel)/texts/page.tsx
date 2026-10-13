import { asc } from "drizzle-orm";
import { db, pageBlocks } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { TextsForm } from "./form";

export default async function TextsAdmin() {
  const rows = await db.select().from(pageBlocks).orderBy(asc(pageBlocks.page), asc(pageBlocks.sortOrder));
  const pages = new Map<string, typeof rows>();
  for (const r of rows) pages.set(r.page, [...(pages.get(r.page) ?? []), r]);
  const order = ["Начало", "За нас", "Дейности", "Програма", "Събития", "Новини", "Контакти", "Записване", "Общи"];
  const sorted = [...pages.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  return (
    <div className="grid gap-5">
      <PageHeader title="Текстове по страниците" intro="Заглавията и въвеждащите текстове на всяка страница. Дейностите, екипът и събитията се редактират в своите раздели." />
      {sorted.map(([page, blocks]) => (
        <TextsForm key={page} page={page} blocks={blocks} />
      ))}
    </div>
  );
}
