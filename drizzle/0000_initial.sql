CREATE TYPE "public"."activity_format" AS ENUM('individual', 'group', 'both');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'handled');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('new', 'confirmed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"tagline" varchar(300) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"color" varchar(9) DEFAULT '#7C5CFF' NOT NULL,
	"format" "activity_format" DEFAULT 'both' NOT NULL,
	"ages" varchar(80) DEFAULT '' NOT NULL,
	"price_info" varchar(200) DEFAULT '' NOT NULL,
	"teacher_id" integer,
	"allow_registration" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_name" varchar(120) DEFAULT '' NOT NULL,
	"action" varchar(40) NOT NULL,
	"entity" varchar(60) NOT NULL,
	"entity_id" varchar(60) DEFAULT '' NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(200) NOT NULL,
	"excerpt" varchar(400) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_url" text DEFAULT '' NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date,
	"time_info" varchar(120) DEFAULT '' NOT NULL,
	"location" varchar(200) DEFAULT '' NOT NULL,
	"price_info" varchar(200) DEFAULT '' NOT NULL,
	"registration_open" boolean DEFAULT true NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(200) DEFAULT '' NOT NULL,
	"phone" varchar(60) DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_blocks" (
	"key" varchar(120) PRIMARY KEY NOT NULL,
	"page" varchar(60) NOT NULL,
	"label" varchar(200) NOT NULL,
	"multiline" boolean DEFAULT true NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(200) NOT NULL,
	"excerpt" varchar(400) DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_url" text DEFAULT '' NOT NULL,
	"published_at" timestamp with time zone,
	"author_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer,
	"event_id" integer,
	"target_label" varchar(200) DEFAULT '' NOT NULL,
	"parent_name" varchar(160) NOT NULL,
	"child_name" varchar(160) DEFAULT '' NOT NULL,
	"child_age" varchar(20) DEFAULT '' NOT NULL,
	"phone" varchar(60) NOT NULL,
	"email" varchar(200) DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" "registration_status" DEFAULT 'new' NOT NULL,
	"admin_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"weekday" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) DEFAULT '' NOT NULL,
	"activity_id" integer,
	"title" varchar(160) DEFAULT '' NOT NULL,
	"teacher_id" integer,
	"group_label" varchar(120) DEFAULT '' NOT NULL,
	"room" varchar(80) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(80) PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"role_title" varchar(200) DEFAULT '' NOT NULL,
	"photo_url" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(200) NOT NULL,
	"name" varchar(120) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'editor' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_teacher_id_team_members_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_season_id_schedule_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."schedule_seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_teacher_id_team_members_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;