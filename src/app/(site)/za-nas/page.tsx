import type { Metadata } from "next";
import { getBlocks, getVisibleTeam } from "@/lib/data";
import { Section, WaveTitle } from "@/components/site/shell";
import { renderMarkdown } from "@/lib/markdown";
import { cld } from "@/lib/cloudinary";

export const revalidate = 3600;
export const metadata: Metadata = { title: "За нас", description: "Кои сме ние и кой преподава в БарбарониТЕ." };

export default async function AboutPage() {
  const [t, team] = await Promise.all([getBlocks("За нас"), getVisibleTeam()]);
  return (
    <>
      <Section className="!pt-10">
        <div className="flex flex-col items-center gap-10">
          {t["about.image"] && <img src={cld(t["about.image"], 1400)} alt="БарбарониТЕ – твори смело" className="w-full max-w-[700px] h-auto" fetchPriority="high" />}
          <div className="text-content prose max-w-[900px] text-center [&_p]:mx-auto" dangerouslySetInnerHTML={{ __html: renderMarkdown(t["about.intro"] || "") }} />
        </div>
      </Section>
      <Section className="!pt-16 !pb-20">
        <WaveTitle>{t["about.team.title"] || "Нашият екип"}</WaveTitle>
        <div className="grid gap-20 mt-12">
          {team.map((m) => {
            const photo = m.bioPhotoUrl || m.photoUrl;
            return (
              <article key={m.id} id={m.slug} className="scroll-mt-20 max-w-[900px] mx-auto text-center">
                {photo && <img src={cld(photo, 900)} alt={m.name} className="w-[min(100%,420px)] h-auto rounded-[20px] mx-auto mb-7 block object-cover" loading="lazy" />}
                <h2>{m.name}</h2>
                <p className="mx-auto font-bold text-[#555] mb-5">{m.roleTitle}</p>
                {m.bio && <div className="text-content prose text-center [&_p]:mx-auto" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.bio) }} />}
              </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}
