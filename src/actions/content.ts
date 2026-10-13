"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, activities, teamMembers } from "@/db";
import { assertUser } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { slugify } from "@/lib/slug";
import { type ActionState, str, bool, int, optInt, zodErrors, errorState, revalidateSite, hexColor } from "./_shared";

// ---------- Дейности ----------
const activitySchema = z.object({
  name: z.string().min(2, "Въведете име"),
  slug: z.string().min(1),
  tagline: z.string().max(300, "Максимум 300 символа"),
  description: z.string(),
  imageUrl: z.string(),
  color: hexColor,
  format: z.enum(["individual", "group", "both"]),
  ages: z.string().max(80),
  priceInfo: z.string().max(200),
  teacherId: z.number().int().nullable(),
  allowRegistration: z.boolean(),
  sortOrder: z.number().int(),
  visible: z.boolean(),
});

function activityInput(fd: FormData) {
  const name = str(fd, "name");
  return {
    name,
    slug: slugify(str(fd, "slug") || name),
    tagline: str(fd, "tagline"),
    description: str(fd, "description"),
    imageUrl: str(fd, "imageUrl"),
    color: str(fd, "color") || "#7C5CFF",
    format: str(fd, "format") || "both",
    ages: str(fd, "ages"),
    priceInfo: str(fd, "priceInfo"),
    teacherId: optInt(fd, "teacherId"),
    allowRegistration: bool(fd, "allowRegistration"),
    sortOrder: int(fd, "sortOrder"),
    visible: bool(fd, "visible"),
  };
}

export async function saveActivityAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await assertUser();
  const id = optInt(fd, "id");
  const parsed = activitySchema.safeParse(activityInput(fd));
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    if (id) {
      await db.update(activities).set({ ...parsed.data, updatedAt: new Date() }).where(eq(activities.id, id));
      await logAction(user, "update", "activity", id, parsed.data.name);
    } else {
      const [row] = await db.insert(activities).values(parsed.data).returning({ id: activities.id });
      await logAction(user, "create", "activity", row.id, parsed.data.name);
    }
  } catch (e) {
    return errorState(e);
  }
  revalidateSite();
  redirect("/admin/activities?saved=1");
}

export async function deleteActivityAction(id: number): Promise<void> {
  const user = await assertUser();
  const [row] = await db.delete(activities).where(eq(activities.id, id)).returning({ name: activities.name });
  await logAction(user, "delete", "activity", id, row?.name ?? "");
  revalidateSite();
  redirect("/admin/activities?deleted=1");
}

// ---------- Екип ----------
const memberSchema = z.object({
  name: z.string().min(2, "Въведете име"),
  slug: z.string().min(1),
  roleTitle: z.string().max(200),
  photoUrl: z.string(),
  bioPhotoUrl: z.string(),
  bio: z.string(),
  sortOrder: z.number().int(),
  visible: z.boolean(),
});

export async function saveMemberAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await assertUser();
  const id = optInt(fd, "id");
  const name = str(fd, "name");
  const parsed = memberSchema.safeParse({
    name,
    slug: slugify(str(fd, "slug") || name),
    roleTitle: str(fd, "roleTitle"),
    photoUrl: str(fd, "photoUrl"),
    bioPhotoUrl: str(fd, "bioPhotoUrl"),
    bio: str(fd, "bio"),
    sortOrder: int(fd, "sortOrder"),
    visible: bool(fd, "visible"),
  });
  if (!parsed.success) return zodErrors(parsed.error);
  try {
    if (id) {
      await db.update(teamMembers).set({ ...parsed.data, updatedAt: new Date() }).where(eq(teamMembers.id, id));
      await logAction(user, "update", "team", id, parsed.data.name);
    } else {
      const [row] = await db.insert(teamMembers).values(parsed.data).returning({ id: teamMembers.id });
      await logAction(user, "create", "team", row.id, parsed.data.name);
    }
  } catch (e) {
    return errorState(e);
  }
  revalidateSite();
  redirect("/admin/team?saved=1");
}

export async function deleteMemberAction(id: number): Promise<void> {
  const user = await assertUser();
  const [row] = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning({ name: teamMembers.name });
  await logAction(user, "delete", "team", id, row?.name ?? "");
  revalidateSite();
  redirect("/admin/team?deleted=1");
}
