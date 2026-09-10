"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, count, and } from "drizzle-orm";
import { z } from "zod";
import { db, pageBlocks, settings, users, registrations, inquiries, activities, events } from "@/db";
import { assertUser, hashPassword } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { notify } from "@/lib/email";
import { DEFAULT_SETTINGS } from "@/lib/data";
import { type ActionState, str, bool, int, optInt, zodErrors, errorState, revalidateSite } from "./_shared";

// ---------- Текстове ----------
export async function saveBlocksAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await assertUser();
  const page = str(fd, "page");
  const rows = await db.select({ key: pageBlocks.key }).from(pageBlocks).where(eq(pageBlocks.page, page));
  try {
    for (const r of rows) {
      const v = fd.get(`block:${r.key}`);
      if (typeof v === "string") await db.update(pageBlocks).set({ content: v.trim() }).where(eq(pageBlocks.key, r.key));
    }
    await logAction(user, "update", "texts", page);
  } catch (e) {
    return errorState(e);
  }
  revalidateSite();
  return { success: "Текстовете са записани и публикувани." };
}

// ---------- Настройки ----------
export async function saveSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await assertUser("admin");
  try {
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      const v = fd.get(`s:${key}`);
      if (typeof v !== "string") continue;
      await db
        .insert(settings)
        .values({ key, value: v.trim() })
        .onConflictDoUpdate({ target: settings.key, set: { value: v.trim() } });
    }
    await logAction(user, "update", "settings");
  } catch (e) {
    return errorState(e);
  }
  revalidateSite();
  return { success: "Настройките са записани." };
}

// ---------- Потребители ----------
const userSchema = z.object({
  name: z.string().min(2, "Въведете име"),
  email: z.string().email("Невалиден имейл"),
  role: z.enum(["admin", "editor"]),
  active: z.boolean(),
});

export async function saveUserAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await assertUser("admin");
  const id = optInt(fd, "id");
  const parsed = userSchema.safeParse({
    name: str(fd, "name"),
    email: str(fd, "email").toLowerCase(),
    role: str(fd, "role") || "editor",
    active: bool(fd, "active"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const password = str(fd, "password");
  if (!id && password.length < 10) return { error: "Паролата трябва да е поне 10 символа.", fieldErrors: { password: "Минимум 10 символа" } };
  if (password && password.length < 10) return { error: "Паролата трябва да е поне 10 символа.", fieldErrors: { password: "Минимум 10 символа" } };

  try {
    if (id) {
      if (id === me.id && (!parsed.data.active || parsed.data.role !== "admin")) {
        return { error: "Не можете да деактивирате или понижите собствения си профил." };
      }
      // Да не остане системата без администратор
      if (parsed.data.role !== "admin" || !parsed.data.active) {
        const [{ n }] = await db.select({ n: count() }).from(users).where(and(eq(users.role, "admin"), eq(users.active, true)));
        const [target] = await db.select({ role: users.role, active: users.active }).from(users).where(eq(users.id, id)).limit(1);
        if (target?.role === "admin" && target.active && n <= 1) return { error: "Това е единственият активен администратор." };
      }
      const set: Partial<typeof users.$inferInsert> = { ...parsed.data };
      if (password) set.passwordHash = await hashPassword(password);
      await db.update(users).set(set).where(eq(users.id, id));
      await logAction(me, "update", "user", id, parsed.data.email + (password ? " (нова парола)" : ""));
    } else {
      const [row] = await db
        .insert(users)
        .values({ ...parsed.data, passwordHash: await hashPassword(password) })
        .returning({ id: users.id });
      await logAction(me, "create", "user", row.id, parsed.data.email);
    }
  } catch (e) {
    return errorState(e);
  }
  redirect("/admin/users?saved=1");
}

export async function deleteUserAction(id: number): Promise<void> {
  const me = await assertUser("admin");
  if (id === me.id) throw new Error("Не можете да изтриете собствения си профил.");
  const [row] = await db.delete(users).where(eq(users.id, id)).returning({ email: users.email });
  await logAction(me, "delete", "user", id, row?.email ?? "");
  redirect("/admin/users?deleted=1");
}

// ---------- Записвания и запитвания (панел) ----------
export async function setRegistrationStatusAction(id: number, status: "new" | "confirmed" | "declined", adminNote?: string): Promise<void> {
  const user = await assertUser();
  const set: Partial<typeof registrations.$inferInsert> = { status };
  if (adminNote !== undefined) set.adminNote = adminNote;
  await db.update(registrations).set(set).where(eq(registrations.id, id));
  await logAction(user, "status", "registration", id, status);
  redirect("/admin/registrations");
}

export async function updateRegistrationAction(fd: FormData): Promise<void> {
  const id = int(fd, "id");
  const status = str(fd, "status") as "new" | "confirmed" | "declined";
  await setRegistrationStatusAction(id, ["new", "confirmed", "declined"].includes(status) ? status : "new", str(fd, "adminNote"));
}

export async function deleteRegistrationAction(id: number): Promise<void> {
  const user = await assertUser();
  await db.delete(registrations).where(eq(registrations.id, id));
  await logAction(user, "delete", "registration", id);
  redirect("/admin/registrations");
}

export async function setInquiryStatusAction(id: number, status: "new" | "handled"): Promise<void> {
  const user = await assertUser();
  await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
  await logAction(user, "status", "inquiry", id, status);
  redirect("/admin/inquiries");
}

export async function deleteInquiryAction(id: number): Promise<void> {
  const user = await assertUser();
  await db.delete(inquiries).where(eq(inquiries.id, id));
  await logAction(user, "delete", "inquiry", id);
  redirect("/admin/inquiries");
}

// ---------- Публични форми ----------
// Проста защита срещу спам: скрито поле (honeypot) + минимално време за попълване + лимит по IP.
const recent = new Map<string, number[]>();
async function rateLimited(bucket: string): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "ip";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const list = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 5) return true;
  list.push(now);
  recent.set(key, list);
  return false;
}

function spamCheck(fd: FormData): string | null {
  if (str(fd, "website")) return "spam"; // honeypot
  const started = Number(str(fd, "started") || 0);
  if (started && Date.now() - started < 3000) return "Формата беше изпратена твърде бързо. Опитайте отново.";
  return null;
}

const phoneRe = /^[+\d][\d\s()./-]{5,}$/;

const contactSchema = z.object({
  name: z.string().min(2, "Въведете име"),
  email: z.union([z.string().email("Невалиден имейл"), z.literal("")]),
  phone: z.union([z.string().regex(phoneRe, "Невалиден телефон"), z.literal("")]),
  message: z.string().min(5, "Напишете съобщение"),
});

export async function contactAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const spam = spamCheck(fd);
  if (spam === "spam") return { success: "Благодарим! Ще се свържем с вас скоро." };
  if (spam) return { error: spam };
  if (await rateLimited("contact")) return { error: "Твърде много съобщения за кратко време. Опитайте по-късно." };

  const parsed = contactSchema.safeParse({ name: str(fd, "name"), email: str(fd, "email"), phone: str(fd, "phone"), message: str(fd, "message") });
  if (!parsed.success) return zodErrors(parsed.error);
  if (!parsed.data.email && !parsed.data.phone) return { error: "Оставете имейл или телефон за връзка.", fieldErrors: { phone: "Имейл или телефон" } };

  await db.insert(inquiries).values(parsed.data);
  await notify(`Ново запитване от ${parsed.data.name}`, [
    `Име: ${parsed.data.name}`,
    `Имейл: ${parsed.data.email || "–"}`,
    `Телефон: ${parsed.data.phone || "–"}`,
    `Съобщение: ${parsed.data.message}`,
    `Вижте го в панела: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/inquiries`,
  ]);
  return { success: "Благодарим! Ще се свържем с вас скоро." };
}

const registerSchema = z.object({
  target: z.string().min(1, "Изберете дейност или събитие"),
  parentName: z.string().min(2, "Въведете вашето име"),
  childName: z.string().max(160),
  childAge: z.string().max(20),
  phone: z.string().regex(phoneRe, "Невалиден телефон"),
  email: z.union([z.string().email("Невалиден имейл"), z.literal("")]),
  message: z.string().max(2000),
});

export async function registerAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const spam = spamCheck(fd);
  if (spam === "spam") return { success: "Благодарим! Ще се свържем с вас, за да уточним детайлите." };
  if (spam) return { error: spam };
  if (await rateLimited("register")) return { error: "Твърде много записвания за кратко време. Опитайте по-късно." };

  const parsed = registerSchema.safeParse({
    target: str(fd, "target"),
    parentName: str(fd, "parentName"),
    childName: str(fd, "childName"),
    childAge: str(fd, "childAge"),
    phone: str(fd, "phone"),
    email: str(fd, "email"),
    message: str(fd, "message"),
  });
  if (!parsed.success) return zodErrors(parsed.error);

  // target има вида "activity:12" или "event:3"
  const [kind, rawId] = parsed.data.target.split(":");
  const targetId = Number(rawId);
  let activityId: number | null = null;
  let eventId: number | null = null;
  let targetLabel = "";
  if (kind === "activity") {
    const [a] = await db.select({ id: activities.id, name: activities.name }).from(activities).where(eq(activities.id, targetId)).limit(1);
    if (!a) return { error: "Избраната дейност не е намерена." };
    activityId = a.id;
    targetLabel = a.name;
  } else if (kind === "event") {
    const [e] = await db.select({ id: events.id, title: events.title }).from(events).where(eq(events.id, targetId)).limit(1);
    if (!e) return { error: "Избраното събитие не е намерено." };
    eventId = e.id;
    targetLabel = e.title;
  } else {
    return { error: "Изберете дейност или събитие.", fieldErrors: { target: "Изберете" } };
  }

  const { target: _t, ...rest } = parsed.data;
  await db.insert(registrations).values({ ...rest, activityId, eventId, targetLabel });
  await notify(`Ново записване: ${targetLabel}`, [
    `За: ${targetLabel}`,
    `Родител/участник: ${rest.parentName}`,
    `Дете: ${rest.childName || "–"} ${rest.childAge ? `(${rest.childAge})` : ""}`,
    `Телефон: ${rest.phone}`,
    `Имейл: ${rest.email || "–"}`,
    `Бележка: ${rest.message || "–"}`,
    `Вижте го в панела: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/registrations`,
  ]);
  return { success: "Благодарим! Ще се свържем с вас, за да уточним детайлите." };
}
