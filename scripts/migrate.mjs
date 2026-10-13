// Изпълнява миграциите само когато има база данни. Така първият deploy минава и без нея –
// сайтът излиза с началното съдържание, а панелът се включва след добавяне на DATABASE_URL.
import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("[migrate] DATABASE_URL не е зададен – миграциите се пропускат; сайтът ще ползва началното съдържание.");
  process.exit(0);
}
const r = spawnSync("npx", ["drizzle-kit", "migrate"], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
