import type { Metadata } from "next";
import { getBlocks, getPastEvents, getUpcomingEvents } from "@/lib/data";
import { EventBlock } from "@/components/site/cards";
import { PageTitle, Section, WaveDivider, WaveTitle } from "@/components/site/shell";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Събития", description: "Летни академии, лагери, концерти и работилници в БарбарониТЕ." };

export default async function EventsPage() {
  const [t, upcoming, past] = await Promise.all([getBlocks("Събития"), getUpcomingEvents(), getPastEvents(30)]);
  return (
    <>
      <Section>
        <PageTitle title={t["events.title"] || "Събития"} intro={t["events.intro"]} />
        {upcoming.length === 0 ? (
          <p className="lead text-center mx-auto">В момента няма обявени предстоящи събития – следете новините ни.</p>
        ) : (
          <div className="grid gap-20">{upcoming.map((e) => <EventBlock key={e.id} e={e} />)}</div>
        )}
      </Section>
      {past.length > 0 && (
        <>
          <WaveDivider />
          <Section className="!pb-16">
            <WaveTitle stroke="#0244ae">Отминали събития</WaveTitle>
            <div className="grid gap-20 mt-10">{past.map((e) => <EventBlock key={e.id} e={e} past />)}</div>
          </Section>
        </>
      )}
    </>
  );
}
