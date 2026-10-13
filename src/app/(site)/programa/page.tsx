import type { Metadata } from "next";
import Link from "next/link";
import { getActiveSchedule, getBlocks } from "@/lib/data";
import { ScheduleTable } from "@/components/site/cards";
import { PageTitle, Section } from "@/components/site/shell";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Програма", description: "Седмичен график на заниманията в БарбарониТЕ.", alternates: { canonical: "/programa" } };

export default async function SchedulePage() {
  const [t, { season, slots }] = await Promise.all([getBlocks("Програма"), getActiveSchedule()]);
  return (
    <Section className="!pb-16">
      <PageTitle title={t["schedule.title"] || "Програма"} intro={t["schedule.intro"]} />
      {season && (
        <div className="text-center mb-8">
          <span className="bb-date">{season.name}</span>
          {season.note && <p className="mx-auto text-[#555]">{season.note}</p>}
        </div>
      )}
      <div className="max-w-[1000px] mx-auto"><ScheduleTable slots={slots} /></div>
      <div className="text-center mt-14">
        <p className="lead mx-auto mb-2">Не намирате подходящ час? Пишете ни – сформираме групи според интереса.</p>
        <Link href="/zapisvane" className="bb-button">Запиши се</Link>
      </div>
    </Section>
  );
}
