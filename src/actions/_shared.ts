import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = { error?: string; success?: string; fieldErrors?: Record<string, string> } | null;

/** Опреснява всички публични страници след промяна в панела. */
export function revalidateSite(): void {
  revalidatePath("/", "layout");
}

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
export function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true" || fd.get(key) === "1";
}
export function int(fd: FormData, key: string, fallback = 0): number {
  const n = Number.parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : fallback;
}
export function optInt(fd: FormData, key: string): number | null {
  const s = str(fd, key);
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

/** Превръща zod грешки в четими съобщения по полета. */
export function zodErrors(err: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = issue.path.join(".") || "_";
    if (!fieldErrors[k]) fieldErrors[k] = issue.message;
  }
  return { error: "Проверете отбелязаните полета.", fieldErrors };
}

export function errorState(e: unknown): ActionState {
  const msg = e instanceof Error ? e.message : "Възникна грешка.";
  // Уникален slug/имейл
  if (/duplicate key|unique/i.test(msg)) return { error: "Вече съществува запис със същия адрес (slug) или имейл." };
  return { error: msg };
}

export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Невалиден цвят (напр. #7C5CFF)");
export const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Час във формат ЧЧ:ММ");
export const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Невалидна дата");
