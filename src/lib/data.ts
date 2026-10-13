import "server-only";
import { and, asc, desc, eq, gte, isNotNull, lt, or, sql } from "drizzle-orm";
import {
  db,
  dbConfigured,
  activities,
  teamMembers,
  scheduleSeasons,
  scheduleSlots,
  events,
  posts,
  pageBlocks,
  settings,
  type Activity,
  type TeamMember,
  type Event,
  type Post,
  type ScheduleSeason,
} from "@/db";
import { todayISO } from "./format";
import * as fb from "./fallback";

// Всяка функция по-долу има и вариант без база (fb.*): така сайтът се публикува и преди
// DATABASE_URL да е зададен, с началното съдържание от src/content/seed.ts.

// ---------- Настройки ----------
export const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "БарбарониТЕ",
  tagline: "Творчески център за деца и възрастни – изкуство, музика и вдъхновение.",
  address: "ул. Васил Кънчев 26, ж.к. Хаджи Димитър, София",
  phone: "+359 887 865 073",
  email: "info@barbaronite.eu",
  notify_email: "info@barbaronite.eu",
  facebook: "https://www.facebook.com/barbaronitesofia/",
  instagram: "",
  youtube: "",
  maps_url: "https://maps.google.com/?q=ул.+Васил+Кънчев+26,+София",
  meta_title: "БарбарониТЕ – творчески център за деца и възрастни в София",
  meta_description:
    "Пиано, пеене, китара, актьорско майсторство, рисуване, български език и математика за деца и възрастни в ж.к. Хаджи Димитър, София.",
};

export async function getSettings(): Promise<Record<string, string>> {
  if (!dbConfigured) return { ...DEFAULT_SETTINGS };
  const rows = await db.select().from(settings);
  const out = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function getSetting(key: string): Promise<string> {
  if (!dbConfigured) return DEFAULT_SETTINGS[key] ?? "";
  const [r] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return r?.value ?? DEFAULT_SETTINGS[key] ?? "";
}

// ---------- Текстове ----------
export async function getBlocks(page?: string): Promise<Record<string, string>> {
  if (!dbConfigured) return fb.fallbackBlocksFor(page);
  const rows = page
    ? await db.select().from(pageBlocks).where(eq(pageBlocks.page, page))
    : await db.select().from(pageBlocks);
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.content;
  return out;
}

// ---------- Дейности ----------
export async function getVisibleActivities(): Promise<Activity[]> {
  if (!dbConfigured) return fb.fallbackActivities;
  return db
    .select()
    .from(activities)
    .where(eq(activities.visible, true))
    .orderBy(asc(activities.sortOrder), asc(activities.id));
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  if (!dbConfigured) return fb.fallbackActivities.find((a) => a.slug === slug) ?? null;
  const [a] = await db.select().from(activities).where(eq(activities.slug, slug)).limit(1);
  return a ?? null;
}

// ---------- Екип ----------
export async function getVisibleTeam(): Promise<TeamMember[]> {
  if (!dbConfigured) return fb.fallbackTeam;
  return db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.visible, true))
    .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.id));
}

export async function getTeamMember(id: number | null): Promise<TeamMember | null> {
  if (!id) return null;
  if (!dbConfigured) return fb.fallbackTeam.find((m) => m.id === id) ?? null;
  const [m] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return m ?? null;
}

// ---------- Програма ----------
export type SlotView = {
  id: number;
  weekday: number;
  startTime: string;
  endTime: string;
  title: string;
  activitySlug: string | null;
  color: string;
  teacher: string;
  groupLabel: string;
  room: string;
};

export async function getActiveSchedule(): Promise<{ season: ScheduleSeason | null; slots: SlotView[] }> {
  if (!dbConfigured) return { season: fb.fallbackSeason, slots: fb.fallbackSlots };
  const [season] = await db.select().from(scheduleSeasons).where(eq(scheduleSeasons.active, true)).limit(1);
  if (!season) return { season: null, slots: [] };
  const slots = await getSeasonSlots(season.id);
  return { season, slots };
}

export async function getSeasonSlots(seasonId: number): Promise<SlotView[]> {
  const rows = await db
    .select({
      id: scheduleSlots.id,
      weekday: scheduleSlots.weekday,
      startTime: scheduleSlots.startTime,
      endTime: scheduleSlots.endTime,
      title: scheduleSlots.title,
      groupLabel: scheduleSlots.groupLabel,
      room: scheduleSlots.room,
      activityName: activities.name,
      activitySlug: activities.slug,
      activityColor: activities.color,
      teacherName: teamMembers.name,
    })
    .from(scheduleSlots)
    .leftJoin(activities, eq(scheduleSlots.activityId, activities.id))
    .leftJoin(teamMembers, eq(scheduleSlots.teacherId, teamMembers.id))
    .where(eq(scheduleSlots.seasonId, seasonId))
    .orderBy(asc(scheduleSlots.weekday), asc(scheduleSlots.startTime));
  return rows.map((r) => ({
    id: r.id,
    weekday: r.weekday,
    startTime: r.startTime,
    endTime: r.endTime,
    title: r.title || r.activityName || "Занимание",
    activitySlug: r.activitySlug,
    color: r.activityColor || "#7C5CFF",
    teacher: r.teacherName || "",
    groupLabel: r.groupLabel,
    room: r.room,
  }));
}

// ---------- Събития ----------
/** Предстоящи: не архивирани и (крайната или началната дата) >= днес. */
export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  const today = todayISO();
  if (!dbConfigured) {
    const list = fb.fallbackEvents.filter((e) => !isEventPast(e)).sort((a, b) => a.startsOn.localeCompare(b.startsOn));
    return limit ? list.slice(0, limit) : list;
  }
  const q = db
    .select()
    .from(events)
    .where(
      and(
        eq(events.visible, true),
        eq(events.archived, false),
        or(gte(events.endsOn, today), and(sql`${events.endsOn} is null`, gte(events.startsOn, today))),
      ),
    )
    .orderBy(asc(events.startsOn));
  return limit ? q.limit(limit) : q;
}

/** Отминали: архивирани ръчно или с изтекла дата. */
export async function getPastEvents(limit = 50): Promise<Event[]> {
  const today = todayISO();
  if (!dbConfigured) return fb.fallbackEvents.filter(isEventPast).sort((a, b) => b.startsOn.localeCompare(a.startsOn)).slice(0, limit);
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.visible, true),
        or(
          eq(events.archived, true),
          lt(events.endsOn, today),
          and(sql`${events.endsOn} is null`, lt(events.startsOn, today)),
        ),
      ),
    )
    .orderBy(desc(events.startsOn))
    .limit(limit);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!dbConfigured) return fb.fallbackEvents.find((e) => e.slug === slug) ?? null;
  const [e] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return e ?? null;
}

export function isEventPast(e: { startsOn: string; endsOn: string | null; archived: boolean }): boolean {
  const today = todayISO();
  return e.archived || (e.endsOn ? e.endsOn < today : e.startsOn < today);
}

// ---------- Новини ----------
export async function getPublishedPosts(limit?: number): Promise<Post[]> {
  if (!dbConfigured) return limit ? fb.fallbackPosts.slice(0, limit) : fb.fallbackPosts;
  const q = db
    .select()
    .from(posts)
    .where(and(isNotNull(posts.publishedAt), sql`${posts.publishedAt} <= now()`))
    .orderBy(desc(posts.publishedAt));
  return limit ? q.limit(limit) : q;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!dbConfigured) return fb.fallbackPosts.find((p) => p.slug === slug) ?? null;
  const [p] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return p ?? null;
}

// ---------- Списъци за падащи менюта в панела ----------
export type Option = { id: number; name: string };

export async function getTeacherOptions(): Promise<Option[]> {
  return db.select({ id: teamMembers.id, name: teamMembers.name }).from(teamMembers).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.id));
}

export async function getActivityOptions(): Promise<Option[]> {
  return db.select({ id: activities.id, name: activities.name }).from(activities).orderBy(asc(activities.sortOrder), asc(activities.id));
}
