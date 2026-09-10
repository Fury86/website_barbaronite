import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, activities, teamMembers, scheduleSlots } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { SlotForm } from "../../../slot-form";

export default async function EditSlot({ params }: { params: Promise<{ seasonId: string; slotId: string }> }) {
  const { seasonId, slotId } = await params;
  const [slot] = await db.select().from(scheduleSlots).where(eq(scheduleSlots.id, Number(slotId))).limit(1);
  if (!slot) notFound();
  const [acts, teachers] = await Promise.all([
    db.select({ id: activities.id, name: activities.name }).from(activities).orderBy(asc(activities.sortOrder)),
    db.select({ id: teamMembers.id, name: teamMembers.name }).from(teamMembers).orderBy(asc(teamMembers.sortOrder)),
  ]);
  return (
    <div>
      <PageHeader title="Редакция на занимание" />
      <SlotForm seasonId={Number(seasonId)} slot={slot} activities={acts} teachers={teachers} />
    </div>
  );
}
