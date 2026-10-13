"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveSeasonAction } from "@/actions/schedule-events-news";
import { Notice, SubmitButton } from "@/components/admin/client";
import { Checkbox, Fieldset, TextField } from "@/components/admin/fields";
import type { ScheduleSeason } from "@/db/schema";

export function SeasonForm({ season }: { season?: ScheduleSeason }) {
  const [state, action] = useActionState(saveSeasonAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-5 max-w-xl">
      {season && <input type="hidden" name="id" value={season.id} />}
      <Notice state={state} />
      <Fieldset title="Сезон">
        <TextField name="name" label="Име" required defaultValue={season?.name} placeholder="напр. Есен 2026" error={fe.name} />
        <TextField name="note" label="Бележка (показва се над програмата)" defaultValue={season?.note} placeholder="напр. Графикът важи от 15 септември" />
        <Checkbox name="active" label="Активен сезон (показва се на сайта)" defaultChecked={season?.active ?? false} hint="Само един сезон може да е активен." />
      </Fieldset>
      <div className="flex gap-3">
        <SubmitButton>{season ? "Запази" : "Създай сезона"}</SubmitButton>
        <Link href="/admin/schedule" className="btn btn-ghost">Отказ</Link>
      </div>
    </form>
  );
}
