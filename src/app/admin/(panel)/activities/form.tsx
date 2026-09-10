"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveActivityAction } from "@/actions/content";
import { ImageField, Notice, SubmitButton } from "@/components/admin/client";
import { Checkbox, Fieldset, FormRow, Select, TextArea, TextField } from "@/components/admin/fields";
import type { Activity } from "@/db/schema";

const COLORS = ["#7C5CFF", "#FF6B5B", "#FF9F1C", "#E64980", "#2FBF9B", "#4C8DFF", "#FFC63D", "#2B2140"];

export function ActivityForm({ activity, teachers }: { activity?: Activity; teachers: Array<{ id: number; name: string }> }) {
  const [state, action] = useActionState(saveActivityAction, null);
  const fe = state?.fieldErrors ?? {};
  const a = activity;
  return (
    <form action={action} className="grid gap-5">
      {a && <input type="hidden" name="id" value={a.id} />}
      <Notice state={state} />
      <Fieldset title="Основно">
        <FormRow>
          <TextField name="name" label="Име на дейността" required defaultValue={a?.name} error={fe.name} />
          <TextField name="slug" label="Адрес (slug)" defaultValue={a?.slug} hint="Оставете празно, за да се генерира от името." error={fe.slug} />
        </FormRow>
        <TextField name="tagline" label="Кратко описание (за картичката)" defaultValue={a?.tagline} maxLength={300} error={fe.tagline} hint="До 300 символа – показва се на началната страница." />
        <TextArea name="description" label="Пълно описание" defaultValue={a?.description} rows={8} markdown error={fe.description} />
        <ImageField name="imageUrl" label="Лого / снимка на дейността" defaultValue={a?.imageUrl} />
      </Fieldset>
      <Fieldset title="Детайли">
        <FormRow cols={3}>
          <Select name="format" label="Формат" defaultValue={a?.format ?? "both"} options={[{ value: "both", label: "Индивидуално и групово" }, { value: "individual", label: "Индивидуално" }, { value: "group", label: "Групово" }]} />
          <TextField name="ages" label="Възраст" defaultValue={a?.ages} placeholder="напр. 6+ г. или 1–7 клас" />
          <TextField name="priceInfo" label="Цена (текст)" defaultValue={a?.priceInfo} placeholder="напр. 25 лв. / занятие" />
        </FormRow>
        <FormRow cols={3}>
          <Select name="teacherId" label="Преподавател" defaultValue={a?.teacherId ?? ""} options={[{ value: "", label: "— без —" }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]} />
          <div className="field">
            <label htmlFor="color">Цвят</label>
            <div className="flex items-center gap-2">
              <input id="color" name="color" type="color" defaultValue={a?.color ?? "#7C5CFF"} list="bb-colors" className="h-11 w-16 rounded-lg border-2 border-line bg-white p-1" />
              <datalist id="bb-colors">{COLORS.map((c) => <option key={c} value={c} />)}</datalist>
              <span className="hint">Цветът на картичката и в програмата.</span>
            </div>
            {fe.color && <span className="err">{fe.color}</span>}
          </div>
          <TextField name="sortOrder" label="Подредба" type="number" defaultValue={a?.sortOrder ?? 0} hint="По-малко число = по-напред." />
        </FormRow>
        <FormRow>
          <Checkbox name="visible" label="Показва се на сайта" defaultChecked={a?.visible ?? true} />
          <Checkbox name="allowRegistration" label="Позволява онлайн записване" defaultChecked={a?.allowRegistration ?? true} />
        </FormRow>
      </Fieldset>
      <div className="flex gap-3">
        <SubmitButton>{a ? "Запази промените" : "Създай дейността"}</SubmitButton>
        <Link href="/admin/activities" className="btn btn-ghost">Отказ</Link>
      </div>
    </form>
  );
}
