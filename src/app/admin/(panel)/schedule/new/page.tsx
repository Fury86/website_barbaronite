import { PageHeader } from "@/components/admin/page-header";
import { SeasonForm } from "../season-form";

export default function NewSeason() {
  return (
    <div>
      <PageHeader title="Нов сезон" />
      <SeasonForm />
    </div>
  );
}
