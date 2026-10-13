import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

/** Има ли конфигурирана база данни. Без нея сайтът показва началното съдържание, а панелът – инструкции. */
export const dbConfigured = Boolean(url);

type Db = NodePgDatabase<typeof schema>;

// В serverless среда (Vercel) всяка функция може да създаде свой Pool – затова е малък
// и се кешира глобално, за да се преизползва между извиквания в същия процес.
const globalForDb = globalThis as unknown as { __bbDb?: Db };

function connect(): Db {
  if (!url) throw new Error("DATABASE_URL липсва. Добавете Neon Postgres от Vercel Marketplace (Storage) или попълнете .env.local");
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const pool = new Pool({ connectionString: url, max: 3, ssl: isLocal ? undefined : { rejectUnauthorized: false } });
  return drizzle(pool, { schema });
}

/** Връзката се отваря при първата заявка, не при import – така кодът се зарежда и без база. */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    globalForDb.__bbDb ??= connect();
    const value = Reflect.get(globalForDb.__bbDb, prop);
    return typeof value === "function" ? value.bind(globalForDb.__bbDb) : value;
  },
});

export * from "./schema";
