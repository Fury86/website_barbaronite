import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL липсва. Добавете Neon Postgres от Vercel Marketplace или попълнете .env.local");

const isLocal = /localhost|127\.0\.0\.1/.test(url);

// В serverless среда (Vercel) всяка функция може да създаде свой Pool – затова е малък
// и се кешира глобално, за да се преизползва между извиквания в същия процес.
const globalForDb = globalThis as unknown as { __bbPool?: Pool };
const pool =
  globalForDb.__bbPool ??
  new Pool({
    connectionString: url,
    max: 3,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });
globalForDb.__bbPool = pool;

export const db = drizzle(pool, { schema });
export * from "./schema";
