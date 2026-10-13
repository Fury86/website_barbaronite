"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageField } from "@/components/admin/client";

export function CopyUrl({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn btn-outline btn-sm w-full" onClick={async () => { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 1500); }}>
      {ok ? "Копирано" : "Копирай адреса"}
    </button>
  );
}

export function MediaUploader() {
  const router = useRouter();
  return (
    <div className="card p-4">
      <ImageField name="upload" label="Качи нова снимка" hint="След качване натиснете „Опресни“, за да я видите в списъка." />
      <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => router.refresh()}>Опресни списъка</button>
    </div>
  );
}
