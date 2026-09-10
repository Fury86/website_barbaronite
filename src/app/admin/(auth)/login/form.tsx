"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/admin/client";
import { TextField } from "@/components/admin/fields";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="card p-6 grid gap-4">
      {state?.error && <div role="alert" className="rounded-xl bg-coral/10 text-coral-deep px-4 py-3 text-sm font-bold">{state.error}</div>}
      <TextField name="email" label="Имейл" type="email" required />
      <TextField name="password" label="Парола" type="password" required />
      <SubmitButton className="btn btn-ink w-full">Вход</SubmitButton>
    </form>
  );
}
