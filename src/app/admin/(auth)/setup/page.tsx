import { count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, users } from "@/db";
import { SetupForm } from "./form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Първоначална настройка – БарбарониТЕ", robots: { index: false } };

export default async function SetupPage() {
  const [{ n }] = await db.select({ n: count() }).from(users);
  if (n > 0) redirect("/admin/login");
  return (
    <div className="grid gap-4">
      <p className="text-sm text-ink-soft text-center">
        Няма нито един потребител. Създайте първия администратор – тази страница ще изчезне след това.
      </p>
      <SetupForm />
    </div>
  );
}
