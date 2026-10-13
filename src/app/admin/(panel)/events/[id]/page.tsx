import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, events } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { EventForm } from "../form";

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event] = await db.select().from(events).where(eq(events.id, Number(id))).limit(1);
  if (!event) notFound();
  return (
    <div>
      <PageHeader title={event.title} intro={`Публичен адрес: /sabitiya/${event.slug}`} />
      <EventForm event={event} />
    </div>
  );
}
