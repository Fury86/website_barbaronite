"use client";

import { useActionState } from "react";
import { setupAction } from "@/actions/auth";
import { SubmitButton } from "@/components/admin/client";
import { Checkbox, TextField } from "@/components/admin/fields";

export function SetupForm() {
  const [state, action] = useActionState(setupAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="card p-6 grid gap-4">
      {state?.error && <div role="alert" className="rounded-xl bg-coral/10 text-coral-deep px-4 py-3 text-sm font-bold">{state.error}</div>}
      <TextField name="name" label="Вашето име" required error={fe.name} />
      <TextField name="email" label="Имейл" type="email" required error={fe.email} />
      <TextField name="password" label="Парола" type="password" required error={fe.password} hint="Поне 10 символа" />
      <TextField name="password2" label="Повторете паролата" type="password" required error={fe.password2} />
      <Checkbox name="seed" label="Зареди съдържанието от текущия сайт" defaultChecked hint="Дейности, екип, текстове, примерна програма и събития – всичко може да се редактира после." />
      <SubmitButton className="btn btn-ink w-full">Създай администратор</SubmitButton>
    </form>
  );
}
