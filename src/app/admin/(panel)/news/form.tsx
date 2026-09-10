"use client";

import { useActionState } from "react";
import Link from "next/link";
import { savePostAction } from "@/actions/schedule-events-news";
import { ImageField, Notice, SubmitButton } from "@/components/admin/client";
import { Checkbox, Fieldset, FormRow, TextArea, TextField } from "@/components/admin/fields";
import type { Post } from "@/db/schema";

export function PostForm({ post }: { post?: Post }) {
  const [state, action] = useActionState(savePostAction, null);
  const fe = state?.fieldErrors ?? {};
  const p = post;
  return (
    <form action={action} className="grid gap-5">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Notice state={state} />
      <Fieldset title="Публикация">
        <FormRow>
          <TextField name="title" label="Заглавие" required defaultValue={p?.title} error={fe.title} />
          <TextField name="slug" label="Адрес (slug)" defaultValue={p?.slug} hint="Оставете празно, за да се генерира от заглавието." />
        </FormRow>
        <TextField name="excerpt" label="Кратко описание (за списъка и Google)" defaultValue={p?.excerpt} maxLength={400} error={fe.excerpt} />
        <TextArea name="content" label="Текст" defaultValue={p?.content} rows={14} markdown />
        <ImageField name="coverUrl" label="Корица" defaultValue={p?.coverUrl} />
        <Checkbox name="published" label="Публикувана (вижда се на сайта)" defaultChecked={Boolean(p?.publishedAt)} />
      </Fieldset>
      <div className="flex gap-3">
        <SubmitButton>{p ? "Запази" : "Създай публикацията"}</SubmitButton>
        <Link href="/admin/news" className="btn btn-ghost">Отказ</Link>
      </div>
    </form>
  );
}
