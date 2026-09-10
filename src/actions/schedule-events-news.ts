"use server";

import { redirect } from "next/navigation";
import { eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, scheduleSeasons, scheduleSlots, events, posts } from "@/db";
import { assertUser } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { slugify } from "@/lib/slug";
import { type ActionState, str, bool, int, optInt, zodErrors, errorState, revalidateSite, timeStr, dateStr } from "./_shared";

// ---------- Програма: сезони ----------
export async function saveSeasonAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await assertUser();
  const id = optInt(fd, "id");
  const name = str(fd, "name");
  if (name.length < 2) return { error: "Въведете име на сезона.", fieldErrors: { name: "Въведете име" } };
  const data = { name, note: str(fd, "note"), active: bool(fd, "active") };
  try {
    let seasonId = id;
    if (id) {
      await db.update(scheduleSeasons).set(data).where(eq(scheduleSeasons.id, id));
    } else {
      const [row] = await db.insert(scheduleSeasons).values(data).returning({ id: scheduleSeasons.id });
      seasonId = row.id;
    }
    // Само един активен сезон
    if (data.active && seasonId) {
      await db.update(scheduleSeasons).set({ active: false }).where(ne(scheduleSeasons.id, seasonId));
    }
    await logAction(user, id ? "update" : "create", "season", seasonId ?? "", name);
  } catch (e) {
    return errorState(e);
  }
  revalidateSite();
  redirect("/admin/schedule?saved=1");
}

export async function activateSeasonAction(id: number): Promise<void> {
  const user = await assertUser();
  await db.update(scheduleSeasons).set({ active: false });
  await db.update(scheduleSeasons).set({ active: true }).where(eq(scheduleSeasons.id, id));
  await logAction(user, "status", "season", id, "Активиран");
  revalidateSite();
  redirect("/admin/schedule?saved=1");
}

export async function deleteSeasonAction(id: number): Promise<void> {
  const user = await assertUser();
  const [row] = await db.delete(scheduleSeasons).where(eq(scheduleSeasons.id, id)).returning({ name: scheduleSeasons.name });
  await logAction(user, "delete", "season", id, row?.name ?? "");
  revalidateSite();
  redirect("/admin/schedule?deleted=1");
}

// ---------- Програма: занимания ----------
const slotSchema = z.object({
  seasonId: z.number().int().positive(),
  weekday: z.number().int().min(1).max(7),
  startTime: timeStr,
  endTime: z.union([timeStr, z.literal("")]),
  activityId: z.number().int().nullable(),
  title: z.string().max(160),
  teacherId: z.number().int().nullable(),
  groupLabel: z.string().max(120),
  room: z.string().max(80),
});

export async function saveSlotAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await assertUser();
  const id = optInt(fd, "id");
  const parsed = slotSchema.safeParse({
    seasonId: int(fd, "seasonId"),
    weekday: int(fd, "weekday", 1),
    startTime: str(fd, "startTime"),
    endTime: str(fd, "endTime"),
    activityId: optInt(fd, "activityId"),
    title: str(fd, "title"),
    teacherId: optInt(fd, "teacherId"),
    groupLabel: str(fd, "groupLabel"),
    room: str(fd, "room"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  if (!parsed.data.activityId && !parsed.data.title) return { error: "Изберете дейност или въведете заглавие.", fieldErrors: { title: "Дейност или заглавие" } };
  try {
    if (id) {
      await db.update(scheduleSlots).set(parsed.data).where(eq(scheduleSlots.id, id));
      await logAction(user, "update", "slot", id);
    } else {
      const [row] = await db.insert(scheduleSlots).values(parsed.data).returning({ id: scheduleSlots.id });
      await logAction(user, "create", "slot", row.id);
    }
  } catch (e) {
    return errorState(e);
  }
  revalidateSite();
  redirect(`/admin/schedule/${parsed.data.seasonId}?saved=1`);
}

export async function deleteSlotAction(id: number, seasonId: number): Promise<void> {
  const user = await assertUser();
  await db.delete(scheduleSlots).where(eq(scheduleSlots.id, id));
  await logAction(user, "delete", "slot", id);
  revalidateSite();
  redirect(`/admin/schedule/${seasonId}?deleted=1`);
}

// ---------- Събития ----------
const eventSchema = z.object({
  title: z.string().min(2, "Въведете заглавие"),
  slug: z.string().min(1),
  subtitle: z.string().max(200, "Максимум 200 символа"),
  excerpt: z.string().max(400, "Максимум 400 символа"),
  description: z.string(),
  coverUrl: z.string(),
  gallery: z.string(),
  startsOn: dateStr,
  endsOn: z.union([dateStr, z.literal("")]).transform((v) => v || null),
  timeInfo: z.string().max(120),
  location: z.string().max(200),
  priceInfo: z.string().max(200),
  registrationOpen: z.boolean(),
  archived: z.boolean(),
  visible: z.boolean(),
});

export async function saveEventAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await assertUser();
  const id = optInt(fd, "id");
  const title = str(fd, "title");
  const parsed = eventSchema.safeParse({
    title,
    slug: slugify(str(fd, "slug") || title),
    subtitle: str(fd, "subtitle"),
    excerpt: str(fd, "excerpt"),
    description: str(fd, "description"),
    coverUrl: str(fd, "coverUrl"),
    gallery: str(fd, "gallery").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join("\n"),
    startsOn: str(fd, "startsOn"),
    endsOn: str(fd, "endsOn"),
    timeInfo: str(fd, "timeInfo"),
    location: str(fd, "location"),
    priceInfo: str(fd, "priceInfo"),
    registrationOpen: bool(fd, "registrationOpen"),
    archived: bool(fd, "archived"),
    visible: bool(fd, "visible"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  if (parsed.data.endsOn && parsed.data.endsOn < parsed.data.startsOn) {
    return { error: "Крайната дата е преди началната.", fieldErrors: { endsOn: "Преди началната дата" } };
  }
  try {
    if (id) {
      await db.update(events).set({ ...parsed.data, updatedAt: new Date() }).where(eq(events.id, id));
      await logAction(user, "update", "event", id, title);
    } else {
      const [row] = await db.insert(events).values(parsed.data).returning({ id: events.id });
      await logAction(user, "create", "event", row.id, title);
    }
  } catch (e) {
    return errorState(e);
  }
  revalidateSite();
  redirect("/admin/events?saved=1");
}

export async function archiveEventAction(id: number, archived: boolean): Promise<void> {
  const user = await assertUser();
  await db.update(events).set({ archived, updatedAt: new Date() }).where(eq(events.id, id));
  await logAction(user, "status", "event", id, archived ? "Архивирано" : "Върнато от архива");
  revalidateSite();
  redirect("/admin/events?saved=1");
}

export async function deleteEventAction(id: number): Promise<void> {
  const user = await assertUser();
  const [row] = await db.delete(events).where(eq(events.id, id)).returning({ title: events.title });
  await logAction(user, "delete", "event", id, row?.title ?? "");
  revalidateSite();
  redirect("/admin/events?deleted=1");
}

// ---------- Новини ----------
const postSchema = z.object({
  title: z.string().min(2, "Въведете заглавие"),
  slug: z.string().min(1),
  excerpt: z.string().max(400, "Максимум 400 символа"),
  content: z.string(),
  coverUrl: z.string(),
});

export async function savePostAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await assertUser();
  const id = optInt(fd, "id");
  const title = str(fd, "title");
  const parsed = postSchema.safeParse({
    title,
    slug: slugify(str(fd, "slug") || title),
    excerpt: str(fd, "excerpt"),
    content: str(fd, "content"),
    coverUrl: str(fd, "coverUrl"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  const publish = bool(fd, "published");
  try {
    if (id) {
      const [existing] = await db.select({ publishedAt: posts.publishedAt }).from(posts).where(eq(posts.id, id)).limit(1);
      const publishedAt = publish ? (existing?.publishedAt ?? new Date()) : null;
      await db.update(posts).set({ ...parsed.data, publishedAt, updatedAt: new Date() }).where(eq(posts.id, id));
      await logAction(user, "update", "post", id, title);
    } else {
      const [row] = await db
        .insert(posts)
        .values({ ...parsed.data, publishedAt: publish ? new Date() : null, authorId: user.id })
        .returning({ id: posts.id });
      await logAction(user, "create", "post", row.id, title);
    }
  } catch (e) {
    return errorState(e);
  }
  revalidateSite();
  redirect("/admin/news?saved=1");
}

export async function deletePostAction(id: number): Promise<void> {
  const user = await assertUser();
  const [row] = await db.delete(posts).where(eq(posts.id, id)).returning({ title: posts.title });
  await logAction(user, "delete", "post", id, row?.title ?? "");
  revalidateSite();
  redirect("/admin/news?deleted=1");
}
