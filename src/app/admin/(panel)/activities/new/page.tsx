import { asc } from "drizzle-orm";
import { db, teamMembers } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { ActivityForm } from "../form";

export default async function NewActivity() {
  const teachers = await db.select({ id: teamMembers.id, name: teamMembers.name }).from(teamMembers).orderBy(asc(teamMembers.sortOrder));
  return (
    <div>
      <PageHeader title="Нова дейност" />
      <ActivityForm teachers={teachers} />
    </div>
  );
}
