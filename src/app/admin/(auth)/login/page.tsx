import { count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, users } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Вход – БарбарониТЕ", robots: { index: false } };

export default async function LoginPage() {
  const [{ n }] = await db.select({ n: count() }).from(users);
  if (n === 0) redirect("/admin/setup");
  if (await getCurrentUser()) redirect("/admin");
  return <LoginForm />;
}
