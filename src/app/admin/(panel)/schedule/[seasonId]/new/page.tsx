import { asc } from "drizzle-orm";
import { db, activities, teamMembers } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { SlotForm } from "../../slot-form";

export default async function NewSlot({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const [acts, teachers] = await Promise.all([
    db.select({ id: activities.id, name: activities.name }).from(activities).orderBy(asc(activities.sortOrder)),
    db.select({ id: teamMembers.id, name: teamMembers.name }).from(teamMembers).orderBy(asc(teamMembers.sortOrder)),
  ]);
  return (
    <div>
      <PageHeader title="Ново занимание" />
      <SlotForm seasonId={Number(seasonId)} activities={acts} teachers={teachers} />
    </div>
  );
}
