import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, users, type User } from "@/db";
import { cache } from "react";

export const SESSION_COOKIE = "bb_session";
const SESSION_DAYS = 7;

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET липсва или е твърде кратък (мин. 16 символа)");
  return new TextEncoder().encode(s);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: Pick<User, "id" | "role">): Promise<void> {
  const token = await new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

/** Текущият потребител или null. Кешира се в рамките на една заявка. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const uid = Number(payload.uid);
    if (!uid) return null;
    const [u] = await db
      .select({ id: users.id, email: users.email, name: users.name, role: users.role, active: users.active })
      .from(users)
      .where(eq(users.id, uid))
      .limit(1);
    if (!u || !u.active) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  } catch {
    return null;
  }
});

/** За страници: пренасочва към вход, ако няма сесия (или няма нужната роля). */
export async function requireUser(role?: "admin"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin?denied=1");
  return user;
}

/** За server actions: хвърля грешка вместо redirect. */
export async function assertUser(role?: "admin"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Сесията е изтекла. Влезте отново.");
  if (role === "admin" && user.role !== "admin") throw new Error("Нямате права за това действие.");
  return user;
}

// Проста защита срещу brute-force (в паметта на процеса; bcrypt допълнително забавя опитите).
const attempts = new Map<string, { count: number; until: number }>();
export function checkLoginAllowed(key: string): { ok: boolean; waitSec: number } {
  const a = attempts.get(key);
  if (a && a.until > Date.now()) return { ok: false, waitSec: Math.ceil((a.until - Date.now()) / 1000) };
  return { ok: true, waitSec: 0 };
}
export function recordLoginFailure(key: string): void {
  const a = attempts.get(key) ?? { count: 0, until: 0 };
  a.count += 1;
  if (a.count >= 5) {
    a.until = Date.now() + Math.min(15, 2 ** (a.count - 5)) * 60 * 1000;
  }
  attempts.set(key, a);
}
export function clearLoginFailures(key: string): void {
  attempts.delete(key);
}
