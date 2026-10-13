import type { Metadata } from "next";
import { getBlocks, getPublishedPosts } from "@/lib/data";
import { PostCard } from "@/components/site/cards";
import { PageTitle, Section } from "@/components/site/shell";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Новини", description: "Новини от творческия център БарбарониТЕ.", alternates: { canonical: "/novini" } };

export default async function NewsPage() {
  const [t, posts] = await Promise.all([getBlocks("Новини"), getPublishedPosts()]);
  return (
    <Section className="!pb-16">
      <PageTitle title={t["news.title"] || "Новини"} intro={t["news.intro"]} />
      {posts.length === 0 ? <p className="lead text-center mx-auto">Скоро ще има новини.</p> : (
        <div className="bb-cards">{posts.map((p) => <PostCard key={p.id} p={p} />)}</div>
      )}
    </Section>
  );
}
