import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "../form";

export default async function NewUser() {
  await requireUser("admin");
  return (
    <div>
      <PageHeader title="Нов потребител" />
      <UserForm />
    </div>
  );
}
