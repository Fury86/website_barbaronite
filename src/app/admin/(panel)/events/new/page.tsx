import { PageHeader } from "@/components/admin/page-header";
import { EventForm } from "../form";

export default function NewEvent() {
  return (
    <div>
      <PageHeader title="Ново събитие" />
      <EventForm />
    </div>
  );
}
