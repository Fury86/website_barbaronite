"use client";

import { useActionState } from "react";
import { saveBlocksAction } from "@/actions/misc";
import { Notice, SubmitButton } from "@/components/admin/client";
import { TextArea, TextField } from "@/components/admin/fields";
import type { PageBlock } from "@/db/schema";

export function TextsForm({ page, blocks }: { page: string; blocks: PageBlock[] }) {
  const [state, action] = useActionState(saveBlocksAction, null);
  return (
    <form action={action} className="card p-5 md:p-6 grid gap-4">
      <input type="hidden" name="page" value={page} />
      <h2 className="text-lg">{page}</h2>
      <Notice state={state} />
      {blocks.map((b) =>
        b.multiline ? (
          <TextArea key={b.key} name={`block:${b.key}`} label={b.label} defaultValue={b.content} rows={4} markdown />
        ) : (
          <TextField key={b.key} name={`block:${b.key}`} label={b.label} defaultValue={b.content} />
        ),
      )}
      <div><SubmitButton className="btn btn-ink btn-sm">Запази „{page}“</SubmitButton></div>
    </form>
  );
}
