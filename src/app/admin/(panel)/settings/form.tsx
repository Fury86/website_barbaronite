"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/actions/misc";
import { Notice, SubmitButton } from "@/components/admin/client";
import { Fieldset, FormRow, TextArea, TextField } from "@/components/admin/fields";

export function SettingsForm({ values: v }: { values: Record<string, string> }) {
  const [state, action] = useActionState(saveSettingsAction, null);
  return (
    <form action={action} className="grid gap-5 max-w-3xl">
      <Notice state={state} />
      <Fieldset title="Контакти">
        <FormRow>
          <TextField name="s:site_name" label="Име на сайта" defaultValue={v.site_name} />
          <TextField name="s:tagline" label="Слоган" defaultValue={v.tagline} />
        </FormRow>
        <TextField name="s:address" label="Адрес" defaultValue={v.address} />
        <FormRow cols={3}>
          <TextField name="s:phone" label="Телефон" defaultValue={v.phone} />
          <TextField name="s:email" label="Имейл (показва се на сайта)" type="email" defaultValue={v.email} />
          <TextField name="s:notify_email" label="Имейл за известия" type="email" defaultValue={v.notify_email} hint="Тук идват новите записвания и запитвания." />
        </FormRow>
        <TextField name="s:maps_url" label="Линк към Google Maps" defaultValue={v.maps_url} />
      </Fieldset>
      <Fieldset title="Социални мрежи">
        <FormRow cols={3}>
          <TextField name="s:facebook" label="Facebook" defaultValue={v.facebook} />
          <TextField name="s:instagram" label="Instagram" defaultValue={v.instagram} />
          <TextField name="s:youtube" label="YouTube" defaultValue={v.youtube} />
        </FormRow>
      </Fieldset>
      <Fieldset title="SEO">
        <TextField name="s:meta_title" label="Заглавие за Google (начална страница)" defaultValue={v.meta_title} maxLength={70} hint="До 60–70 символа." />
        <TextArea name="s:meta_description" label="Описание за Google" defaultValue={v.meta_description} rows={3} hint="До 160 символа." />
      </Fieldset>
      <div><SubmitButton>Запази настройките</SubmitButton></div>
    </form>
  );
}
