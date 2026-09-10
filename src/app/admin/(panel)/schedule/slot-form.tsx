"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveSlotAction } from "@/actions/schedule-events-news";
import { Notice, SubmitButton } from "@/components/admin/client";
import { Fieldset, FormRow, Select, TextField } from "@/components/admin/fields";
import type { ScheduleSlot } from "@/db/schema";
import { WEEKDAYS } from "@/lib/format";

type Opt = { id: number; name: string };

export function SlotForm({ seasonId, slot, activities, teachers }: { seasonId: number; slot?: ScheduleSlot; activities: Opt[]; teachers: Opt[] }) {
  const [state, action] = useActionState(saveSlotAction, null);
  const fe = state?.fieldErrors ?? {};
  const s = slot;
  return (
    <form action={action} className="grid gap-5 max-w-2xl">
      <input type="hidden" name="seasonId" value={seasonId} />
      {s && <input type="hidden" name="id" value={s.id} />}
      <Notice state={state} />
      <Fieldset title="Кога">
        <FormRow cols={3}>
          <Select name="weekday" label="Ден" defaultValue={s?.weekday ?? 1} options={[1, 2, 3, 4, 5, 6, 7].map((d) => ({ value: d, label: WEEKDAYS[d] }))} error={fe.weekday} />
          <TextField name="startTime" label="Начало" type="time" required defaultValue={s?.startTime} error={fe.startTime} />
          <TextField name="endTime" label="Край" type="time" defaultValue={s?.endTime} error={fe.endTime} />
        </FormRow>
      </Fieldset>
      <Fieldset title="Какво">
        <FormRow>
          <Select name="activityId" label="Дейност" defaultValue={s?.activityId ?? ""} options={[{ value: "", label: "— друго (въведете заглавие) —" }, ...activities.map((a) => ({ value: a.id, label: a.name }))]} error={fe.activityId} />
          <TextField name="title" label="Заглавие (по избор)" defaultValue={s?.title} placeholder="ако е различно от името на дейността" error={fe.title} />
        </FormRow>
        <FormRow cols={3}>
          <Select name="teacherId" label="Преподавател" defaultValue={s?.teacherId ?? ""} options={[{ value: "", label: "— без —" }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]} />
          <TextField name="groupLabel" label="Група / възраст" defaultValue={s?.groupLabel} placeholder="напр. 6–8 г. или 7 клас" />
          <TextField name="room" label="Зала" defaultValue={s?.room} />
        </FormRow>
      </Fieldset>
      <div className="flex gap-3">
        <SubmitButton>{s ? "Запази" : "Добави заниманието"}</SubmitButton>
        <Link href={`/admin/schedule/${seasonId}`} className="btn btn-ghost">Отказ</Link>
      </div>
    </form>
  );
}
