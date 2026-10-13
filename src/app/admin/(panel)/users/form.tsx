"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveUserAction } from "@/actions/misc";
import { Notice, SubmitButton } from "@/components/admin/client";
import { Checkbox, Fieldset, FormRow, Select, TextField } from "@/components/admin/fields";
import type { User } from "@/db/schema";

export function UserForm({ user }: { user?: Pick<User, "id" | "name" | "email" | "role" | "active"> }) {
  const [state, action] = useActionState(saveUserAction, null);
  const fe = state?.fieldErrors ?? {};
  const u = user;
  return (
    <form action={action} className="grid gap-5 max-w-2xl">
      {u && <input type="hidden" name="id" value={u.id} />}
      <Notice state={state} />
      <Fieldset title="Профил">
        <FormRow>
          <TextField name="name" label="Име" required defaultValue={u?.name} error={fe.name} />
          <TextField name="email" label="Имейл (за вход)" type="email" required defaultValue={u?.email} error={fe.email} />
        </FormRow>
        <FormRow>
          <Select name="role" label="Роля" defaultValue={u?.role ?? "editor"} options={[{ value: "editor", label: "Редактор – съдържание, записвания, запитвания" }, { value: "admin", label: "Администратор – пълен достъп" }]} />
          <TextField name="password" label={u ? "Нова парола (по избор)" : "Парола"} type="password" required={!u} hint="Поне 10 символа." error={fe.password} />
        </FormRow>
        <Checkbox name="active" label="Активен (може да влиза)" defaultChecked={u?.active ?? true} />
      </Fieldset>
      <div className="flex gap-3">
        <SubmitButton>{u ? "Запази" : "Създай потребителя"}</SubmitButton>
        <Link href="/admin/users" className="btn btn-ghost">Отказ</Link>
      </div>
    </form>
  );
}
