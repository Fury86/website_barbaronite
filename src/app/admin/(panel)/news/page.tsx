import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, posts } from "@/db";
import { formatDateTime } from "@/lib/format";
import { deletePostAction } from "@/actions/schedule-events-news";
import { DeleteButton, FlashNotice } from "@/components/admin/client";
import { Empty, PageHeader } from "@/components/admin/page-header";

export default async function NewsAdmin() {
  const rows = await db.select().from(posts).orderBy(desc(posts.updatedAt));
  return (
    <div className="grid gap-5">
      <PageHeader title="Новини" intro="Черновите не се виждат на сайта. Публикуваната дата се записва при първото публикуване." action={{ href: "/admin/news/new", label: "+ Нова публикация" }} />
      <FlashNotice />
      {rows.length === 0 ? <Empty>Няма публикации.</Empty> : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead><tr><th>Заглавие</th><th>Статус</th><th>Променена</th><th></th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/news/${p.id}`} className="font-extrabold hover:underline">{p.title}</Link>
                    <div className="text-xs text-ink-soft">/novini/{p.slug}</div>
                  </td>
                  <td>{p.publishedAt ? <span className="badge bg-mint/20 text-[#1c7a63]">Публикувана · {formatDateTime(p.publishedAt)}</span> : <span className="badge bg-sun/30">Чернова</span>}</td>
                  <td className="whitespace-nowrap text-ink-soft">{formatDateTime(p.updatedAt)}</td>
                  <td className="text-right whitespace-nowrap">
                    <Link href={`/admin/news/${p.id}`} className="btn btn-ghost btn-sm">Редакция</Link>
                    <DeleteButton action={deletePostAction.bind(null, p.id)} />
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
