import type { Metadata } from "next";
import Link from "next/link";
import { getBlocks, getVisibleActivities } from "@/lib/data";
import { Section, WaveTitle } from "@/components/site/shell";
import { renderMarkdown } from "@/lib/markdown";
import { cld } from "@/lib/cloudinary";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Дейности", description: "Пиано, пеене, китара, актьорско майсторство, рисуване, БЕЛ и математика за деца и възрастни." };

export default async function ActivitiesPage() {
  const [t, acts] = await Promise.all([getBlocks("Дейности"), getVisibleActivities()]);
  return (
    <Section className="!py-16 md:!py-20">
      <div className="text-center max-w-[900px] mx-auto mb-16 md:mb-20">
        <WaveTitle as="h1">{t["activities.title"] || "Нашите дейности"}</WaveTitle>
        {t["activities.intro"] && <p className="lead mx-auto mt-5 leading-[1.8]">{t["activities.intro"]}</p>}
      </div>

      {acts.map((a, i) => (
        <div key={a.id} id={a.slug} className={`bb-row scroll-mt-20 ${i % 2 === 1 ? "reverse" : ""}`}>
          <div className="logo">
            {a.imageUrl && <img src={cld(a.imageUrl, 800)} alt={a.name} loading={i < 2 ? "eager" : "lazy"} />}
          </div>
          <div className="content">
            <h3>{a.name}</h3>
            <div className="prose lead" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.description || a.tagline) }} />
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href={`/deynosti/${a.slug}`} className="bb-more">Часове и преподавател</Link>
              {a.allowRegistration && <Link href={`/zapisvane?za=activity:${a.id}`} className="bb-more red">Запиши се</Link>}
            </div>
          </div>
        </div>
      ))}

      {t["activities.outro"] && (
        <div className="text-content prose max-w-[900px] mx-auto text-center [&_p]:mx-auto" dangerouslySetInnerHTML={{ __html: renderMarkdown(t["activities.outro"]) }} />
      )}
    </Section>
  );
}
