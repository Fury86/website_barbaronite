export const WEEKDAYS = ["", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];
export const WEEKDAYS_SHORT = ["", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"];
const MONTHS = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"];
const MONTHS_SHORT = ["яну", "фев", "мар", "апр", "май", "юни", "юли", "авг", "сеп", "окт", "ное", "дек"];

function toDate(d: string | Date | null | undefined): Date | null {
  if (!d) return null;
  if (d instanceof Date) return d;
  // date колоните идват като "YYYY-MM-DD" – интерпретираме ги като локална дата
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(d);
}

export function formatDate(d: string | Date | null | undefined): string {
  const dt = toDate(d);
  if (!dt) return "";
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatDateTime(d: string | Date | null | undefined): string {
  const dt = toDate(d);
  if (!dt) return "";
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${formatDate(dt)}, ${hh}:${mm}`;
}

/** Период на събитие: "12–16 август 2026" или "3 октомври 2026". */
export function formatRange(start: string, end?: string | null): string {
  const s = toDate(start)!;
  const e = toDate(end);
  if (!e || e.getTime() === s.getTime()) return formatDate(s);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${MONTHS[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${formatDate(s)} – ${formatDate(e)}`;
}

export function dateParts(d: string): { day: string; month: string } {
  const dt = toDate(d)!;
  return { day: String(dt.getDate()), month: MONTHS_SHORT[dt.getMonth()] };
}

/** Днешната дата като YYYY-MM-DD (в София). */
export function todayISO(): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Sofia" }));
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function toInputDate(d: string | Date | null | undefined): string {
  const dt = toDate(d);
  if (!dt) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
