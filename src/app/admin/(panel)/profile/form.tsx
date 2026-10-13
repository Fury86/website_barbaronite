"use client";

import { useActionState } from "react";
import { changeOwnPasswordAction } from "@/actions/auth";
import { Notice, SubmitButton } from "@/components/admin/client";
import { Fieldset, TextField } from "@/components/admin/fields";

export function PasswordForm() {
  const [state, action] = useActionState(changeOwnPasswordAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-5 max-w-md">
      <Notice state={state} />
      <Fieldset title="Смяна на парола">
        <TextField name="current" label="Текуща парола" type="password" required error={fe.current} />
        <TextField name="next" label="Нова парола" type="password" required hint="Поне 10 символа." error={fe.next} />
        <TextField name="next2" label="Повторете новата парола" type="password" required error={fe.next2} />
      </Fieldset>
      <div><SubmitButton>Смени паролата</SubmitButton></div>
    </form>
  );
}
