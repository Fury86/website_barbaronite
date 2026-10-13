import "server-only";
import type { Activity, Event, Post, ScheduleSeason, TeamMember } from "@/db/schema";
import { PAGE_BLOCKS, SEED_ACTIVITIES, SEED_EVENTS, SEED_POSTS, SEED_SEASON, SEED_SLOTS, SEED_TEAM } from "@/content/seed";
import type { SlotView } from "./data";

/**
 * Съдържание „на сухо“ – ползва се, когато DATABASE_URL не е зададен, за да може сайтът
 * да се публикува и преди базата да е настроена. Същите данни се зареждат в базата при setup.
 */
const NOW = new Date("2026-09-01T00:00:00Z");

export const fallbackTeam: TeamMember[] = SEED_TEAM.map((m, i) => ({ id: i + 1, visible: true, updatedAt: NOW, ...m }));

const teamBySlug = Object.fromEntries(fallbackTeam.map((m) => [m.slug, m]));

export const fallbackActivities: Activity[] = SEED_ACTIVITIES.map(({ teacherSlug, format, ...a }, i) => ({
  id: i + 1,
  format: format ?? "both",
  priceInfo: "",
  teacherId: teamBySlug[teacherSlug]?.id ?? null,
  allowRegistration: true,
  visible: true,
  updatedAt: NOW,
  ...a,
}));

const activityBySlug = Object.fromEntries(fallbackActivities.map((a) => [a.slug, a]));

export const fallbackSeason: ScheduleSeason = { id: 1, active: true, createdAt: NOW, ...SEED_SEASON };

export const fallbackSlots: SlotView[] = SEED_SLOTS.map((s, i) => {
  const a = activityBySlug[s.activitySlug];
  return {
    id: i + 1,
    weekday: s.weekday,
    startTime: s.startTime,
    endTime: s.endTime,
    title: s.title || a?.name || "Занимание",
    activitySlug: a?.slug ?? null,
    color: a?.color ?? "#7021A3",
    teacher: teamBySlug[s.teacherSlug]?.name ?? "",
    groupLabel: s.groupLabel,
    room: "",
  };
});

export const fallbackEvents: Event[] = SEED_EVENTS.map((e, i) => ({
  id: i + 1,
  coverUrl: "",
  gallery: "",
  endsOn: null,
  timeInfo: "",
  priceInfo: "",
  registrationOpen: true,
  archived: false,
  visible: true,
  updatedAt: NOW,
  ...e,
}));

export const fallbackPosts: Post[] = SEED_POSTS.map((p, i) => ({ id: i + 1, coverUrl: "", publishedAt: NOW, authorId: null, createdAt: NOW, updatedAt: NOW, ...p }));

export const fallbackBlocks: Record<string, string> = Object.fromEntries(PAGE_BLOCKS.map((b) => [b.key, b.content]));
export function fallbackBlocksFor(page?: string): Record<string, string> {
  return Object.fromEntries(PAGE_BLOCKS.filter((b) => !page || b.page === page).map((b) => [b.key, b.content]));
}
