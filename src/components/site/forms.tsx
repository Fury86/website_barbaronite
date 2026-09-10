"use client";

import { useActionState } from "react";
import { contactAction, registerAction } from "@/actions/misc";
import { StartedAt, SubmitButton } from "@/components/admin/client";
import { Select, TextArea, TextField } from "@/components/admin/fields";

function Honeypot() {
  return (
    <div className="hidden" aria-hidden>
      <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

function Result({ state }: { state: { error?: string; success?: string } | null }) {
  if (!state?.error && !state?.success) return null;
  return (
    <div role="status" className={`rounded-2xl px-5 py-4 font-bold ${state.error ? "bg-[#fdecea] text-[#b22222]" : "bg-[#e6f4ea] text-[#1c7a3c]"}`}>
      {state.error ?? state.success}
    </div>
  );
}

export function ContactForm() {
  const [state, action] = useActionState(contactAction, null);
  const fe = state?.fieldErrors ?? {};
  if (state?.success) return <Result state={state} />;
  return (
    <form action={action} className="grid gap-4">
      <StartedAt /><Honeypot />
      <Result state={state} />
      <TextField name="name" label="Вашето име" required error={fe.name} />
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField name="phone" label="Телефон" type="tel" error={fe.phone} />
        <TextField name="email" label="Имейл" type="email" error={fe.email} />
      </div>
      <TextArea name="message" label="Съобщение" required rows={5} error={fe.message} hint="" />
      <div className="text-center sm:text-left"><SubmitButton className="bb-button wide">Изпрати</SubmitButton></div>
    </form>
  );
}

export type Target = { value: string; label: string };

export function RegisterForm({ targets, preselected }: { targets: Target[]; preselected?: string }) {
  const [state, action] = useActionState(registerAction, null);
  const fe = state?.fieldErrors ?? {};
  if (state?.success) return <Result state={state} />;
  return (
    <form action={action} className="grid gap-4">
      <StartedAt /><Honeypot />
      <Result state={state} />
      <Select name="target" label="За какво се записвате" required defaultValue={preselected ?? ""} options={[{ value: "", label: "— изберете —" }, ...targets]} error={fe.target} />
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField name="parentName" label="Вашето име (родител / участник)" required error={fe.parentName} />
        <TextField name="phone" label="Телефон" type="tel" required error={fe.phone} />
      </div>
      <div className="grid sm:grid-cols-[1fr_140px_1fr] gap-4">
        <TextField name="childName" label="Име на детето" error={fe.childName} hint="Ако записвате себе си, оставете празно." />
        <TextField name="childAge" label="Възраст" error={fe.childAge} placeholder="напр. 8" />
        <TextField name="email" label="Имейл" type="email" error={fe.email} />
      </div>
      <TextArea name="message" label="Бележка" rows={3} error={fe.message} hint="Предпочитани дни/часове, опит досега, въпроси." />
      <div className="text-center sm:text-left"><SubmitButton className="bb-button wide">Запиши се</SubmitButton></div>
    </form>
  );
}
