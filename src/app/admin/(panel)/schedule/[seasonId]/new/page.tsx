import { getActivityOptions, getTeacherOptions } from "@/lib/data";
import { PageHeader } from "@/components/admin/page-header";
import { SlotForm } from "../../slot-form";

export default async function NewSlot({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const [activities, teachers] = await Promise.all([getActivityOptions(), getTeacherOptions()]);
  return (
    <div>
      <PageHeader title="Ново занимание" />
      <SlotForm seasonId={Number(seasonId)} activities={activities} teachers={teachers} />
    </div>
  );
}
