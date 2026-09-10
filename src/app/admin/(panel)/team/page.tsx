import Link from "next/link";
import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { db, teamMembers } from "@/db";
import { deleteMemberAction } from "@/actions/content";
import { DeleteButton, Notice } from "@/components/admin/client";
import { Empty, PageHeader } from "@/components/admin/page-header";
import { cld } from "@/lib/cloudinary";

export default async function TeamAdmin() {
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.id));
  return (
    <div className="grid gap-5">
      <PageHeader title="Екип" intro="Преподавателите на страницата „За нас“ и в началото." action={{ href: "/admin/team/new", label: "+ Нов член" }} />
      <Suspense><Notice /></Suspense>
      {rows.length === 0 ? <Empty>Няма добавени членове на екипа.</Empty> : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead><tr><th>#</th><th>Име</th><th>Длъжност</th><th>Статус</th><th></th></tr></thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td className="text-ink-soft">{m.sortOrder}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-paper-deep overflow-hidden shrink-0">{m.photoUrl && <img src={cld(m.photoUrl, 80)} alt="" className="w-full h-full object-cover" />}</span>
                      <Link href={`/admin/team/${m.id}`} className="font-extrabold hover:underline">{m.name}</Link>
                    </div>
                  </td>
                  <td>{m.roleTitle}</td>
                  <td><span className={`badge ${m.visible ? "bg-mint/20 text-[#1c7a63]" : "bg-line text-ink-soft"}`}>{m.visible ? "Видим" : "Скрит"}</span></td>
                  <td className="text-right whitespace-nowrap">
                    <Link href={`/admin/team/${m.id}`} className="btn btn-ghost btn-sm">Редакция</Link>
                    <DeleteButton action={deleteMemberAction.bind(null, m.id)} />
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
