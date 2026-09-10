"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db, users } from "@/db";
import {
  assertUser,
  checkLoginAllowed,
  clearLoginFailures,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  recordLoginFailure,
  verifyPassword,
} from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { seedContent } from "@/db/seed-content";
import { type ActionState, str, bool, zodErrors, errorState, revalidateSite } from "./_shared";

async function clientKey(email: string): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "ip";
  return `${ip}|${email.toLowerCase()}`;
}

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (!email || !password) return { error: "Въведете имейл и парола." };

  const key = await clientKey(email);
  const allowed = checkLoginAllowed(key);
  if (!allowed.ok) return { error: `Твърде много опити. Опитайте отново след ${allowed.waitSec} сек.` };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const ok = user && user.active && (await verifyPassword(password, user.passwordHash));
  if (!ok) {
    recordLoginFailure(key);
    return { error: "Грешен имейл или парола." };
  }
  clearLoginFailures(key);
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user);
  await logAction({ id: user.id, email: user.email, name: user.name, role: user.role }, "login", "session");
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  await destroySession();
  await logAction(user, "logout", "session");
  redirect("/admin/login");
}

const setupSchema = z.object({
  name: z.string().min(2, "Въведете име"),
  email: z.string().email("Невалиден имейл"),
  password: z.string().min(10, "Паролата трябва да е поне 10 символа"),
});

/** Създава първия администратор. Работи само докато няма нито един потребител. */
export async function setupAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const [{ n }] = await db.select({ n: count() }).from(users);
  if (n > 0) return { error: "Първоначалната настройка вече е направена." };

  const parsed = setupSchema.safeParse({ name: str(fd, "name"), email: str(fd, "email").toLowerCase(), password: str(fd, "password") });
  if (!parsed.success) return zodErrors(parsed.error);
  if (parsed.data.password !== str(fd, "password2")) return { error: "Паролите не съвпадат.", fieldErrors: { password2: "Паролите не съвпадат" } };

  try {
    const [user] = await db
      .insert(users)
      .values({ ...parsed.data, passwordHash: await hashPassword(parsed.data.password), role: "admin" })
      .returning();
    if (bool(fd, "seed")) await seedContent();
    revalidateSite(); // публичните страници са кеширани от build-а – да покажат новото съдържание веднага
    await createSession(user);
    await logAction({ id: user.id, email: user.email, name: user.name, role: user.role }, "create", "setup", user.id, "Първоначална настройка");
  } catch (e) {
    return errorState(e);
  }
  redirect("/admin");
}

export async function changeOwnPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await assertUser();
  const current = str(fd, "current");
  const next = str(fd, "next");
  if (next.length < 10) return { error: "Новата парола трябва да е поне 10 символа.", fieldErrors: { next: "Минимум 10 символа" } };
  if (next !== str(fd, "next2")) return { error: "Паролите не съвпадат.", fieldErrors: { next2: "Паролите не съвпадат" } };
  const [user] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
  if (!user || !(await verifyPassword(current, user.passwordHash))) return { error: "Текущата парола е грешна.", fieldErrors: { current: "Грешна парола" } };
  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, me.id));
  await logAction(me, "update", "user", me.id, "Смяна на собствена парола");
  return { success: "Паролата е сменена." };
}
