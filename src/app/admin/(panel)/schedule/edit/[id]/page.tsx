import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, scheduleSeasons } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { SeasonForm } from "../../season-form";

export default async function EditSeason({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [season] = await db.select().from(scheduleSeasons).where(eq(scheduleSeasons.id, Number(id))).limit(1);
  if (!season) notFound();
  return (
    <div>
      <PageHeader title={season.name} />
      <SeasonForm season={season} />
    </div>
  );
}
