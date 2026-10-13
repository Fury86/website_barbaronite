import Link from "next/link";
import type { Activity, Event, Post, TeamMember } from "@/db/schema";
import { cld } from "@/lib/cloudinary";
import { formatDate, formatRange, WEEKDAYS } from "@/lib/format";
import type { SlotView } from "@/lib/data";

/** Разбива списък на редове 3-2-2… (както оригиналния сайт), за да няма самотна картичка на последния ред. */
export function chunkRows<T>(items: T[]): T[][] {
  const sizes: number[] = [];
  let n = items.length;
  while (n > 0) {
    if (n === 4) { sizes.push(2, 2); n = 0; }
    else if (n <= 3) { sizes.push(n); n = 0; }
    else { sizes.push(3); n -= 3; }
  }
  const rows: T[][] = [];
  let i = 0;
  for (const size of sizes) { rows.push(items.slice(i, i + size)); i += size; }
  return rows;
}

export function ActivityCard({ a }: { a: Activity }) {
  return (
    <Link href={`/deynosti/${a.slug}`} className="bb-card">
      {a.imageUrl && <img src={cld(a.imageUrl, 760)} alt={a.name} loading="lazy" />}
      <h3>{a.name}</h3>
      <p>{a.tagline}</p>
      <span className="bb-more">Научи повече</span>
    </Link>
  );
}

export function TeamCard({ m }: { m: TeamMember }) {
  return (
    <Link href={`/za-nas#${m.slug}`} className="bb-team">
      {m.photoUrl && <img src={cld(m.photoUrl, 400)} alt={m.name} width={200} height={200} loading="lazy" />}
      <h3>{m.name}</h3>
      <p>{m.roleTitle}</p>
      <span className="bb-more red">Научи повече</span>
    </Link>
  );
}

export function galleryOf(e: Pick<Event, "gallery" | "coverUrl">): string[] {
  const g = e.gallery.split("\n").map((l) => l.trim()).filter(Boolean);
  if (g.length > 0) return g.slice(0, 3);
  return e.coverUrl ? [e.coverUrl] : [];
}

/** Блок за събитие в стила на оригиналната страница: заглавие, дата в „хапче“, мото, три снимки, линк. */
export function EventBlock({ e, past = false }: { e: Event; past?: boolean }) {
  const photos = galleryOf(e);
  return (
    <article className={`text-center ${past ? "opacity-80" : ""}`}>
      <h2 className="!text-[1.75rem] md:!text-[2rem]"><Link href={`/sabitiya/${e.slug}`} className="hover:underline">{e.title}</Link></h2>
      <p className="bb-date mx-auto">{formatRange(e.startsOn, e.endsOn)}{e.timeInfo && ` · ${e.timeInfo}`}</p>
      {e.subtitle && <h3 className="uppercase">{e.subtitle}</h3>}
      {photos.length > 0 && (
        <div className={`bb-photos ${photos.length < 3 ? "md:!grid-cols-1 max-w-3xl mx-auto" : ""}`}>
          {photos.map((src, i) => (
            <Link key={i} href={`/sabitiya/${e.slug}`}><img src={cld(src, 900)} alt="" loading="lazy" /></Link>
          ))}
        </div>
      )}
      {photos.length === 0 && e.excerpt && <p className="lead mx-auto mt-4">{e.excerpt}</p>}
      <Link href={`/sabitiya/${e.slug}`} className="bb-more red mt-5">Научи повече</Link>
    </article>
  );
}

export function PostCard({ p }: { p: Post }) {
  return (
    <Link href={`/novini/${p.slug}`} className="bb-card !text-left !h-auto">
      {p.coverUrl && <img src={cld(p.coverUrl, 800)} alt="" loading="lazy" />}
      <div className="text-sm text-[#666] mb-1">{formatDate(p.publishedAt)}</div>
      <h3 className="!min-h-0 !text-[1.1rem]">{p.title}</h3>
      {p.excerpt && <p>{p.excerpt}</p>}
      <span className="bb-more self-start">Прочети</span>
    </Link>
  );
}

export function ScheduleTable({ slots }: { slots: SlotView[] }) {
  const byDay = new Map<number, SlotView[]>();
  for (const s of slots) byDay.set(s.weekday, [...(byDay.get(s.weekday) ?? []), s]);
  const days = [1, 2, 3, 4, 5, 6, 7].filter((d) => byDay.has(d));
  if (days.length === 0) return <p className="lead text-center mx-auto">Програмата за този сезон предстои – свържете се с нас за подробности.</p>;
  return (
    <div className="bb-schedule">
      {days.map((d) => (
        <div key={d} className="day">
          <h2>{WEEKDAYS[d]}</h2>
          <ul className="grid gap-2">
            {byDay.get(d)!.map((s) => (
              <li key={s.id} className="bb-slot">
                <span className="time">{s.startTime}{s.endTime && `–${s.endTime}`}</span>
                <span className="font-bold flex items-center">
                  <span className="dot" style={{ background: s.color }} aria-hidden />
                  {s.activitySlug ? <Link href={`/deynosti/${s.activitySlug}`} className="hover:underline">{s.title}</Link> : s.title}
                </span>
                {s.groupLabel && <span className="text-[#555]">{s.groupLabel}</span>}
                {(s.teacher || s.room) && <span className="text-[#555] ml-auto">{[s.teacher, s.room].filter(Boolean).join(" · ")}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
