"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveMemberAction } from "@/actions/content";
import { ImageField, Notice, SubmitButton } from "@/components/admin/client";
import { Checkbox, Fieldset, FormRow, TextArea, TextField } from "@/components/admin/fields";
import type { TeamMember } from "@/db/schema";

export function MemberForm({ member }: { member?: TeamMember }) {
  const [state, action] = useActionState(saveMemberAction, null);
  const fe = state?.fieldErrors ?? {};
  const m = member;
  return (
    <form action={action} className="grid gap-5">
      {m && <input type="hidden" name="id" value={m.id} />}
      <Notice state={state} />
      <Fieldset title="Профил">
        <FormRow>
          <TextField name="name" label="Име" required defaultValue={m?.name} error={fe.name} />
          <TextField name="roleTitle" label="Длъжност / предмет" defaultValue={m?.roleTitle} placeholder="напр. Преподавател по китара" />
        </FormRow>
        <FormRow>
          <ImageField name="photoUrl" label="Малка снимка (картичка в началото)" defaultValue={m?.photoUrl} hint="Квадратна, около 400×400 px." />
          <ImageField name="bioPhotoUrl" label="Голяма снимка (страница „За нас“)" defaultValue={m?.bioPhotoUrl} hint="Портрет, около 800×1000 px. Ако е празно, ползва се малката." />
        </FormRow>
        <TextArea name="bio" label="Биография" defaultValue={m?.bio} rows={7} markdown />
      </Fieldset>
      <Fieldset title="Показване">
        <FormRow cols={3}>
          <TextField name="slug" label="Адрес (slug)" defaultValue={m?.slug} hint="Ползва се за котва в страницата „За нас“." />
          <TextField name="sortOrder" label="Подредба" type="number" defaultValue={m?.sortOrder ?? 0} />
          <Checkbox name="visible" label="Показва се на сайта" defaultChecked={m?.visible ?? true} />
        </FormRow>
      </Fieldset>
      <div className="flex gap-3">
        <SubmitButton>{m ? "Запази промените" : "Добави"}</SubmitButton>
        <Link href="/admin/team" className="btn btn-ghost">Отказ</Link>
      </div>
    </form>
  );
}
