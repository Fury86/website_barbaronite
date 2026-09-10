import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { PasswordForm } from "./form";

export default async function ProfilePage() {
  const me = await requireUser();
  return (
    <div className="grid gap-5">
      <PageHeader title="Моята парола" intro={`Влезли сте като ${me.name} (${me.email}).`} />
      <PasswordForm />
    </div>
  );
}
