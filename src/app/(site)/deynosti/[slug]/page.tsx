import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveSchedule, getActivityBySlug, getTeamMember } from "@/lib/data";
import { renderMarkdown, excerptOf } from "@/lib/markdown";
import { cld } from "@/lib/cloudinary";
import { WEEKDAYS_SHORT } from "@/lib/format";
import { FORMAT_LABEL } from "@/lib/labels";
import { Section, WaveTitle } from "@/components/site/shell";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getActivityBySlug(slug);
  if (!a) return {};
  return { title: a.name, description: a.tagline || excerptOf(a.description), alternates: { canonical: `/deynosti/${a.slug}` }, openGraph: a.imageUrl ? { images: [a.imageUrl] } : undefined };
}

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getActivityBySlug(slug);
  if (!a || !a.visible) notFound();
  const [teacher, { slots }] = await Promise.all([getTeamMember(a.teacherId), getActiveSchedule()]);
  const mine = slots.filter((s) => s.activitySlug === a.slug);

  return (
    <Section className="!py-12 md:!py-16">
      <p className="text-center"><Link href="/deynosti" className="bb-more">Всички дейности</Link></p>
      <div className="text-center mt-6">
        {a.imageUrl && <img src={cld(a.imageUrl, 800)} alt="" className="mx-auto w-full max-w-[320px] h-auto mb-4" fetchPriority="high" />}
        <WaveTitle as="h1">{a.name}</WaveTitle>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 mt-8 max-w-[1100px] mx-auto">
        <div>
          {a.tagline && <p className="lead font-bold mb-5">{a.tagline}</p>}
          <div className="prose lead" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.description) }} />
        </div>
        <aside className="grid gap-4 content-start">
          <div className="bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.05)] p-6">
            <dl className="grid gap-3">
              <div><dt className="text-sm text-[#666]">Формат</dt><dd className="font-bold">{FORMAT_LABEL[a.format]}</dd></div>
              {a.ages && <div><dt className="text-sm text-[#666]">Възраст</dt><dd className="font-bold">{a.ages}</dd></div>}
              {a.priceInfo && <div><dt className="text-sm text-[#666]">Цена</dt><dd className="font-bold">{a.priceInfo}</dd></div>}
              {mine.length > 0 && (
                <div>
                  <dt className="text-sm text-[#666]">В програмата</dt>
                  <dd className="grid gap-1 mt-1">
                    {mine.map((s) => <span key={s.id} className="font-bold">{WEEKDAYS_SHORT[s.weekday]} {s.startTime}{s.endTime && `–${s.endTime}`}{s.groupLabel && <span className="font-normal text-[#666]"> · {s.groupLabel}</span>}</span>)}
                  </dd>
                </div>
              )}
              {teacher && (
                <div>
                  <dt className="text-sm text-[#666]">Преподавател</dt>
                  <dd className="flex items-center gap-3 mt-1">
                    {teacher.photoUrl && <img src={cld(teacher.photoUrl, 120)} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                    <Link href={`/za-nas#${teacher.slug}`} className="font-bold text-bb-link hover:underline">{teacher.name}</Link>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-6 text-center">
              {a.allowRegistration && <Link href={`/zapisvane?za=activity:${a.id}`} className="bb-button">Запиши се</Link>}
              <div className="mt-3"><Link href="/kontakti" className="bb-more">Попитай ни</Link></div>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
}
