import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, teamMembers } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { MemberForm } from "../form";

export default async function EditMember({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, Number(id))).limit(1);
  if (!member) notFound();
  return (
    <div>
      <PageHeader title={member.name} />
      <MemberForm member={member} />
    </div>
  );
}
