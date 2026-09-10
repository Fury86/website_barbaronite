import { defineConfig } from "drizzle-kit";

// За миграции се ползва директната (unpooled) връзка, ако е налична.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL липсва (вижте .env.example)");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
