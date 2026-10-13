import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "./form";

export default async function SettingsAdmin() {
  await requireUser("admin");
  const s = await getSettings();
  return (
    <div className="grid gap-5">
      <PageHeader title="Настройки" intro="Контакти в долната част на сайта, социални мрежи и SEO." />
      <SettingsForm values={s} />
    </div>
  );
}
