import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

// ---------- Потребители на панела ----------
export const userRole = pgEnum("user_role", ["admin", "editor"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("editor"),
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Екип ----------
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  roleTitle: varchar("role_title", { length: 200 }).notNull().default(""),
  photoUrl: text("photo_url").notNull().default(""), // малка снимка (картичка)
  bioPhotoUrl: text("bio_photo_url").notNull().default(""), // голяма снимка (страница „За нас“)
  bio: text("bio").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Дейности (курсове) ----------
export const activityFormat = pgEnum("activity_format", ["individual", "group", "both"]);

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  tagline: varchar("tagline", { length: 300 }).notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  color: varchar("color", { length: 9 }).notNull().default("#7C5CFF"),
  format: activityFormat("format").notNull().default("both"),
  ages: varchar("ages", { length: 80 }).notNull().default(""),
  priceInfo: varchar("price_info", { length: 200 }).notNull().default(""),
  teacherId: integer("teacher_id").references(() => teamMembers.id, { onDelete: "set null" }),
  allowRegistration: boolean("allow_registration").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Програма ----------
export const scheduleSeasons = pgTable("schedule_seasons", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  note: text("note").notNull().default(""),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scheduleSlots = pgTable("schedule_slots", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id")
    .notNull()
    .references(() => scheduleSeasons.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(), // 1 = понеделник … 7 = неделя
  startTime: varchar("start_time", { length: 5 }).notNull(), // "16:00"
  endTime: varchar("end_time", { length: 5 }).notNull().default(""),
  activityId: integer("activity_id").references(() => activities.id, { onDelete: "set null" }),
  title: varchar("title", { length: 160 }).notNull().default(""), // ако е празно – името на дейността
  teacherId: integer("teacher_id").references(() => teamMembers.id, { onDelete: "set null" }),
  groupLabel: varchar("group_label", { length: 120 }).notNull().default(""),
  room: varchar("room", { length: 80 }).notNull().default(""),
});

// ---------- Събития ----------
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  subtitle: varchar("subtitle", { length: 200 }).notNull().default(""), // напр. „ТВОРИ СМЕЛО ПРЕЗ ЛЯТОТО“
  excerpt: varchar("excerpt", { length: 400 }).notNull().default(""),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  gallery: text("gallery").notNull().default(""), // адреси на снимки, по един на ред
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on"),
  timeInfo: varchar("time_info", { length: 120 }).notNull().default(""),
  location: varchar("location", { length: 200 }).notNull().default(""),
  priceInfo: varchar("price_info", { length: 200 }).notNull().default(""),
  registrationOpen: boolean("registration_open").notNull().default(true),
  archived: boolean("archived").notNull().default(false),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Новини ----------
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  excerpt: varchar("excerpt", { length: 400 }).notNull().default(""),
  content: text("content").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  publishedAt: timestamp("published_at", { withTimezone: true }), // null = чернова
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Текстове по страниците ----------
export const pageBlocks = pgTable("page_blocks", {
  key: varchar("key", { length: 120 }).primaryKey(),
  page: varchar("page", { length: 60 }).notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  multiline: boolean("multiline").notNull().default(true),
  content: text("content").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------- Настройки ----------
export const settings = pgTable("settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull().default(""),
});

// ---------- Записвания ----------
export const registrationStatus = pgEnum("registration_status", ["new", "confirmed", "declined"]);

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").references(() => activities.id, { onDelete: "set null" }),
  eventId: integer("event_id").references(() => events.id, { onDelete: "set null" }),
  targetLabel: varchar("target_label", { length: 200 }).notNull().default(""),
  parentName: varchar("parent_name", { length: 160 }).notNull(),
  childName: varchar("child_name", { length: 160 }).notNull().default(""),
  childAge: varchar("child_age", { length: 20 }).notNull().default(""),
  phone: varchar("phone", { length: 60 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().default(""),
  message: text("message").notNull().default(""),
  status: registrationStatus("status").notNull().default("new"),
  adminNote: text("admin_note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Запитвания от контактната форма ----------
export const inquiryStatus = pgEnum("inquiry_status", ["new", "handled"]);

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().default(""),
  phone: varchar("phone", { length: 60 }).notNull().default(""),
  message: text("message").notNull(),
  status: inquiryStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Дневник на действията ----------
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userName: varchar("user_name", { length: 120 }).notNull().default(""),
  action: varchar("action", { length: 40 }).notNull(), // create / update / delete / login …
  entity: varchar("entity", { length: 60 }).notNull(),
  entityId: varchar("entity_id", { length: 60 }).notNull().default(""),
  details: text("details").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type ScheduleSeason = typeof scheduleSeasons.$inferSelect;
export type ScheduleSlot = typeof scheduleSlots.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PageBlock = typeof pageBlocks.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
