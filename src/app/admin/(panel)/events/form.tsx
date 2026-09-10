"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveEventAction } from "@/actions/schedule-events-news";
import { ImageField, Notice, SubmitButton } from "@/components/admin/client";
import { Checkbox, Fieldset, FormRow, TextArea, TextField } from "@/components/admin/fields";
import type { Event } from "@/db/schema";
import { toInputDate } from "@/lib/format";

export function EventForm({ event }: { event?: Event }) {
  const [state, action] = useActionState(saveEventAction, null);
  const fe = state?.fieldErrors ?? {};
  const e = event;
  return (
    <form action={action} className="grid gap-5">
      {e && <input type="hidden" name="id" value={e.id} />}
      <Notice state={state} />
      <Fieldset title="Събитие">
        <FormRow>
          <TextField name="title" label="Заглавие" required defaultValue={e?.title} error={fe.title} />
          <TextField name="slug" label="Адрес (slug)" defaultValue={e?.slug} hint="Оставете празно, за да се генерира от заглавието." />
        </FormRow>
        <TextField name="subtitle" label="Подзаглавие (мото)" defaultValue={e?.subtitle} maxLength={200} error={fe.subtitle} placeholder="напр. ТВОРИ СМЕЛО ПРЕЗ ЛЯТОТО" />
        <TextField name="excerpt" label="Кратко описание (за списъка)" defaultValue={e?.excerpt} maxLength={400} error={fe.excerpt} />
        <TextArea name="description" label="Пълно описание" defaultValue={e?.description} rows={12} markdown />
        <ImageField name="coverUrl" label="Основна снимка / плакат" defaultValue={e?.coverUrl} />
        <TextArea name="gallery" label="Галерия – адреси на снимки, по един на ред" defaultValue={e?.gallery} rows={4} hint="Качете снимките от „Снимки“, копирайте адресите и ги поставете тук. Показват се като мрежа от 3 под заглавието." />
      </Fieldset>
      <Fieldset title="Кога и къде">
        <FormRow cols={3}>
          <TextField name="startsOn" label="Начална дата" type="date" required defaultValue={toInputDate(e?.startsOn)} error={fe.startsOn} />
          <TextField name="endsOn" label="Крайна дата" type="date" defaultValue={toInputDate(e?.endsOn)} hint="За еднодневно събитие оставете празно." error={fe.endsOn} />
          <TextField name="timeInfo" label="Час" defaultValue={e?.timeInfo} placeholder="напр. 10:00 – 14:00" />
        </FormRow>
        <FormRow>
          <TextField name="location" label="Място" defaultValue={e?.location} placeholder="напр. БарбарониТЕ, ул. Васил Кънчев 26" />
          <TextField name="priceInfo" label="Цена (текст)" defaultValue={e?.priceInfo} placeholder="напр. 250 лв. или Безплатно" />
        </FormRow>
      </Fieldset>
      <Fieldset title="Показване">
        <FormRow cols={3}>
          <Checkbox name="visible" label="Показва се на сайта" defaultChecked={e?.visible ?? true} />
          <Checkbox name="registrationOpen" label="Отворено за записване" defaultChecked={e?.registrationOpen ?? true} />
          <Checkbox name="archived" label="Архивирано (в „Отминали“)" defaultChecked={e?.archived ?? false} hint="Става автоматично след крайната дата." />
        </FormRow>
      </Fieldset>
      <div className="flex gap-3">
        <SubmitButton>{e ? "Запази промените" : "Създай събитието"}</SubmitButton>
        <Link href="/admin/events" className="btn btn-ghost">Отказ</Link>
      </div>
    </form>
  );
}
