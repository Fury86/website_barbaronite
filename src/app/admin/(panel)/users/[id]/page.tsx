import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "../form";

export default async function EditUser({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("admin");
  const { id } = await params;
  const [u] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active }).from(users).where(eq(users.id, Number(id))).limit(1);
  if (!u) notFound();
  return (
    <div>
      <PageHeader title={u.name} />
      <UserForm user={u} />
    </div>
  );
}
