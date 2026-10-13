import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { deleteUserAction } from "@/actions/misc";
import { DeleteButton, FlashNotice } from "@/components/admin/client";
import { PageHeader } from "@/components/admin/page-header";

export default async function UsersAdmin() {
  const me = await requireUser("admin");
  const rows = await db.select().from(users).orderBy(asc(users.id));
  return (
    <div className="grid gap-5">
      <PageHeader title="Потребители" intro="Администраторите имат пълен достъп; редакторите управляват съдържание, записвания и запитвания, но не и потребители и настройки." action={{ href: "/admin/users/new", label: "+ Нов потребител" }} />
      <FlashNotice />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Име</th><th>Имейл</th><th>Роля</th><th>Статус</th><th>Последен вход</th><th></th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="font-extrabold"><Link href={`/admin/users/${u.id}`} className="hover:underline">{u.name}</Link>{u.id === me.id && <span className="text-ink-soft font-normal"> (вие)</span>}</td>
                <td>{u.email}</td>
                <td>{u.role === "admin" ? "Администратор" : "Редактор"}</td>
                <td><span className={`badge ${u.active ? "bg-mint/20 text-[#1c7a63]" : "bg-line text-ink-soft"}`}>{u.active ? "Активен" : "Деактивиран"}</span></td>
                <td className="text-ink-soft whitespace-nowrap">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}</td>
                <td className="text-right whitespace-nowrap">
                  <Link href={`/admin/users/${u.id}`} className="btn btn-ghost btn-sm">Редакция</Link>
                  {u.id !== me.id && <DeleteButton action={deleteUserAction.bind(null, u.id)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
