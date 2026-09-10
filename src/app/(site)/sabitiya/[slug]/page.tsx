import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlocks, getEventBySlug, isEventPast } from "@/lib/data";
import { renderMarkdown, excerptOf } from "@/lib/markdown";
import { formatRange } from "@/lib/format";
import { cld } from "@/lib/cloudinary";
import { galleryOf } from "@/components/site/cards";
import { Section, WaveTitle } from "@/components/site/shell";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return {};
  const img = e.coverUrl || galleryOf(e)[0];
  return { title: e.title, description: e.excerpt || excerptOf(e.description), openGraph: img ? { images: [img] } : undefined };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [e, common] = await Promise.all([getEventBySlug(slug), getBlocks("Общи")]);
  if (!e || !e.visible) notFound();
  const past = isEventPast(e);
  const photos = galleryOf(e);
  return (
    <>
      <Section className="!pt-10">
        <p className="text-center"><Link href="/sabitiya" className="bb-more">Всички събития</Link></p>
        <div className="text-center mt-6">
          <WaveTitle as="h1">{e.title}</WaveTitle>
          <p className="bb-date mx-auto">{formatRange(e.startsOn, e.endsOn)}{e.timeInfo && ` · ${e.timeInfo}`}</p>
          {e.subtitle && <h3 className="uppercase">{e.subtitle}</h3>}
          {past && <p className="mx-auto mt-2 text-[#666]">Това събитие вече е отминало.</p>}
          {(e.location || e.priceInfo) && (
            <p className="mx-auto mt-3 text-[#555]">{[e.location, e.priceInfo].filter(Boolean).join(" · ")}</p>
          )}
        </div>
        {photos.length > 0 && (
          <div className={`bb-photos ${photos.length < 3 ? "md:!grid-cols-1 max-w-3xl mx-auto" : ""}`}>
            {photos.map((src, i) => <span key={i}><img src={cld(src, 1000)} alt="" loading={i === 0 ? "eager" : "lazy"} /></span>)}
          </div>
        )}
      </Section>
      <Section className="!py-12 md:!py-16">
        <div className="prose lead max-w-[760px] mx-auto text-center [&_p]:mx-auto [&_h2]:mt-12 [&_h2]:mb-6 [&_h3]:mt-8 [&_h3]:mb-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(e.description) }} />
      </Section>
      <div className="bb-cta">
        <h2>{common["cta.text"] || "Запишете детето си за незабравимо творческо приключение!"}</h2>
        {!past && e.registrationOpen ? (
          <Link href={`/zapisvane?za=event:${e.id}`} className="bb-button">Запиши се</Link>
        ) : (
          <Link href="/kontakti" className="bb-button">Контакти</Link>
        )}
      </div>
    </>
  );
}
