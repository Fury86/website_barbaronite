import type { Metadata } from "next";
import { getBlocks, getUpcomingEvents, getVisibleActivities } from "@/lib/data";
import { RegisterForm } from "@/components/site/forms";
import { PageTitle, Section } from "@/components/site/shell";
import { formatRange } from "@/lib/format";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Записване", description: "Запишете се за занимание или събитие в БарбарониТЕ." };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ za?: string }> }) {
  const [{ za }, t, acts, events] = await Promise.all([searchParams, getBlocks("Записване"), getVisibleActivities(), getUpcomingEvents()]);
  const targets = [
    ...acts.filter((a) => a.allowRegistration).map((a) => ({ value: `activity:${a.id}`, label: a.name })),
    ...events.filter((e) => e.registrationOpen).map((e) => ({ value: `event:${e.id}`, label: `${e.title} (${formatRange(e.startsOn, e.endsOn)})` })),
  ];
  return (
    <Section className="!pb-16">
      <PageTitle title={t["register.title"] || "Записване"} intro={t["register.intro"]} />
      <div className="max-w-[760px] mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 md:p-10">
        <RegisterForm targets={targets} preselected={za} />
      </div>
    </Section>
  );
}
