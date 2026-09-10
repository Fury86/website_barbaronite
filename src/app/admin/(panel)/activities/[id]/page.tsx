import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, activities, teamMembers } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { ActivityForm } from "../form";

export default async function EditActivity({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [activity] = await db.select().from(activities).where(eq(activities.id, Number(id))).limit(1);
  if (!activity) notFound();
  const teachers = await db.select({ id: teamMembers.id, name: teamMembers.name }).from(teamMembers).orderBy(asc(teamMembers.sortOrder));
  return (
    <div>
      <PageHeader title={activity.name} intro={`Публичен адрес: /deynosti/${activity.slug}`} />
      <ActivityForm activity={activity} teachers={teachers} />
    </div>
  );
}
