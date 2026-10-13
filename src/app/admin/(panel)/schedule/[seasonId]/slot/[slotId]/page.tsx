import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, scheduleSlots } from "@/db";
import { getActivityOptions, getTeacherOptions } from "@/lib/data";
import { PageHeader } from "@/components/admin/page-header";
import { SlotForm } from "../../../slot-form";

export default async function EditSlot({ params }: { params: Promise<{ seasonId: string; slotId: string }> }) {
  const { seasonId, slotId } = await params;
  const [slot] = await db.select().from(scheduleSlots).where(eq(scheduleSlots.id, Number(slotId))).limit(1);
  if (!slot) notFound();
  const [activities, teachers] = await Promise.all([getActivityOptions(), getTeacherOptions()]);
  return (
    <div>
      <PageHeader title="Редакция на занимание" />
      <SlotForm seasonId={Number(seasonId)} slot={slot} activities={activities} teachers={teachers} />
    </div>
  );
}
