ALTER TABLE "events" ADD COLUMN "subtitle" varchar(200) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "gallery" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "bio_photo_url" text DEFAULT '' NOT NULL;