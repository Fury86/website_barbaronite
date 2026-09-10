"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import type { ActionState } from "@/actions/_shared";

export function SubmitButton({ children, className = "btn btn-primary" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Записване…" : children}
    </button>
  );
}

/** Показва грешка/успех от server action, плюс флаш от ?saved=1 / ?deleted=1. */
export function Notice({ state }: { state?: ActionState }) {
  const params = useSearchParams();
  const router = useRouter();
  const flash = params.get("saved") ? "Записано и публикувано." : params.get("deleted") ? "Изтрито." : params.get("denied") ? "Нямате права за тази страница." : null;
  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => router.replace(window.location.pathname, { scroll: false }), 3500);
      return () => clearTimeout(t);
    }
  }, [flash, router]);
  const msg = state?.error ?? state?.success ?? flash;
  if (!msg) return null;
  const isError = Boolean(state?.error) || Boolean(params.get("denied"));
  return (
    <div role="status" className={`rounded-xl px-4 py-3 text-sm font-bold ${isError ? "bg-coral/10 text-coral-deep" : "bg-mint/15 text-[#1c7a63]"}`}>
      {msg}
    </div>
  );
}

export function DeleteButton({ action, label = "Изтрий", confirmText = "Сигурни ли сте? Действието е необратимо.", className = "btn btn-danger btn-sm" }: { action: () => Promise<void>; label?: string; confirmText?: string; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) start(() => action());
      }}
    >
      {pending ? "…" : label}
    </button>
  );
}

/** Бутон, който извиква server action без потвърждение (архивирай, активирай…). */
export function ActionButton({ action, children, className = "btn btn-outline btn-sm" }: { action: () => Promise<void>; children: React.ReactNode; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className={className} disabled={pending} onClick={() => start(() => action())}>
      {pending ? "…" : children}
    </button>
  );
}

/** Скрито поле с времето на отваряне на формата – за защита от спам ботове. */
export function StartedAt() {
  const [t, setT] = useState("");
  useEffect(() => setT(String(Date.now())), []);
  return <input type="hidden" name="started" value={t} />;
}

/** Снимка: качване към Cloudinary (подписано от сървъра) или ръчно поставен URL. */
export function ImageField({ name, label, defaultValue = "", hint }: { name: string; label: string; defaultValue?: string; hint?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr("");
    try {
      const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Неуспешно подписване");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sign.apiKey);
      fd.append("timestamp", String(sign.timestamp));
      fd.append("signature", sign.signature);
      fd.append("folder", sign.folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Качването не успя");
      setUrl(data.secure_url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Качването не успя");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div className="flex flex-wrap items-start gap-4">
        <div className="w-28 h-28 rounded-xl border-2 border-dashed border-line bg-paper-deep flex items-center justify-center overflow-hidden shrink-0">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-ink-soft text-center px-2">няма снимка</span>
          )}
        </div>
        <div className="grid gap-2 flex-1 min-w-[220px]">
          <input id={name} name={name} className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/…" />
          <div className="flex flex-wrap gap-2 items-center">
            <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? "Качване…" : "Качи снимка"}
            </button>
            {url && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUrl("")}>Премахни</button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </div>
          {err ? <span className="err">{err}</span> : <span className="hint">{hint ?? "Качва се във вашия Cloudinary акаунт. Може и да поставите готов адрес на снимка."}</span>}
        </div>
      </div>
    </div>
  );
}
