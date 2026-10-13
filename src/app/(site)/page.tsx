import type { Metadata } from "next";
import Link from "next/link";
import { getBlocks, getPublishedPosts, getUpcomingEvents, getVisibleActivities, getVisibleTeam } from "@/lib/data";
import { ActivityCard, EventBlock, PostCard, TeamCard, chunkRows } from "@/components/site/cards";
import { Section, WaveDivider, WaveTitle } from "@/components/site/shell";
import { cld } from "@/lib/cloudinary";

export const revalidate = 3600;
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [t, acts, team, events, posts] = await Promise.all([
    getBlocks("Начало"), getVisibleActivities(), getVisibleTeam(), getUpcomingEvents(2), getPublishedPosts(3),
  ]);

  return (
    <>
      {/* Кои сме ние */}
      <section className="bb-hero">
        <div className="pic">
          {t["home.hero.image"] && <img src={cld(t["home.hero.image"], 1100)} alt="Екипът на БарбарониТЕ" width={500} height={307} fetchPriority="high" />}
        </div>
        <div className="col">
          <WaveTitle>{t["home.hero.title"]}</WaveTitle>
          <p className="lead mt-2">{t["home.hero.text"]}</p>
          <Link href="/za-nas" className="bb-button mt-5">Научи повече</Link>
        </div>
      </section>
      <WaveDivider />

      {/* Дейности */}
      <Section sky>
        <WaveTitle>{t["home.activities.title"]}</WaveTitle>
        <div className="grid gap-[30px] mt-6">
          {chunkRows(acts).map((row, i) => (
            <div key={i} className="bb-cards">{row.map((a) => <ActivityCard key={a.id} a={a} />)}</div>
          ))}
        </div>
      </Section>

      {/* Екип */}
      <Section>
        <WaveTitle>{t["home.team.title"]}</WaveTitle>
        <div className="grid gap-[30px] mt-6">
          {chunkRows(team).map((row, i) => (
            <div key={i} className="bb-cards">{row.map((m) => <TeamCard key={m.id} m={m} />)}</div>
          ))}
        </div>
      </Section>

      {/* Предстоящи събития */}
      {events.length > 0 && (
        <>
          <WaveDivider />
          <Section>
            <WaveTitle>{t["home.events.title"]}</WaveTitle>
            <div className="grid gap-16 mt-8">{events.map((e) => <EventBlock key={e.id} e={e} />)}</div>
            <div className="text-center mt-10"><Link href="/sabitiya" className="bb-button wide">Всички събития</Link></div>
          </Section>
        </>
      )}

      {/* Новини */}
      {posts.length > 0 && (
        <Section sky>
          <WaveTitle>{t["home.news.title"]}</WaveTitle>
          <div className="bb-cards mt-6">{posts.map((p) => <PostCard key={p.id} p={p} />)}</div>
        </Section>
      )}
    </>
  );
}
