import { getTeacherOptions } from "@/lib/data";
import { PageHeader } from "@/components/admin/page-header";
import { ActivityForm } from "../form";

export default async function NewActivity() {
  return (
    <div>
      <PageHeader title="Нова дейност" />
      <ActivityForm teachers={await getTeacherOptions()} />
    </div>
  );
}
