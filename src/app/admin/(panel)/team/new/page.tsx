import { PageHeader } from "@/components/admin/page-header";
import { MemberForm } from "../form";

export default function NewMember() {
  return (
    <div>
      <PageHeader title="Нов член на екипа" />
      <MemberForm />
    </div>
  );
}
