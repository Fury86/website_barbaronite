import "server-only";
import { count } from "drizzle-orm";
import { db, activities, teamMembers, pageBlocks, scheduleSeasons, scheduleSlots, events, posts } from "@/db";
import { PAGE_BLOCKS, SEED_ACTIVITIES, SEED_EVENTS, SEED_POSTS, SEED_SEASON, SEED_SLOTS, SEED_TEAM } from "@/content/seed";

async function isEmpty(table: typeof pageBlocks | typeof teamMembers | typeof activities | typeof scheduleSeasons | typeof events | typeof posts): Promise<boolean> {
  const [{ n }] = await db.select({ n: count() }).from(table);
  return n === 0;
}

/** Вкарва началното съдържание (src/content/seed.ts) в празните таблици. Съществуващи записи не се пипат. */
export async function seedContent(): Promise<void> {
  if (await isEmpty(pageBlocks)) await db.insert(pageBlocks).values(PAGE_BLOCKS);

  if (await isEmpty(teamMembers)) await db.insert(teamMembers).values(SEED_TEAM);
  const teamIds = Object.fromEntries((await db.select({ id: teamMembers.id, slug: teamMembers.slug }).from(teamMembers)).map((t) => [t.slug, t.id]));

  if (await isEmpty(activities)) {
    await db.insert(activities).values(SEED_ACTIVITIES.map(({ teacherSlug, ...a }) => ({ ...a, teacherId: teamIds[teacherSlug] ?? null })));
  }
  const activityIds = Object.fromEntries((await db.select({ id: activities.id, slug: activities.slug }).from(activities)).map((a) => [a.slug, a.id]));

  if (await isEmpty(scheduleSeasons)) {
    const [season] = await db.insert(scheduleSeasons).values({ ...SEED_SEASON, active: true }).returning({ id: scheduleSeasons.id });
    if (SEED_SLOTS.length > 0) {
      await db.insert(scheduleSlots).values(
        SEED_SLOTS.map(({ activitySlug, teacherSlug, ...s }) => ({ ...s, seasonId: season.id, activityId: activityIds[activitySlug] ?? null, teacherId: teamIds[teacherSlug] ?? null })),
      );
    }
  }

  if (await isEmpty(events)) await db.insert(events).values(SEED_EVENTS);

  if (SEED_POSTS.length > 0 && (await isEmpty(posts))) {
    await db.insert(posts).values(SEED_POSTS.map((p) => ({ ...p, publishedAt: new Date() })));
  }
}
