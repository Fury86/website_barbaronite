import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/data";
import { renderMarkdown, excerptOf } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import { cld } from "@/lib/cloudinary";
import { Section, WaveTitle } from "@/components/site/shell";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p || !p.publishedAt) return {};
  return { title: p.title, description: p.excerpt || excerptOf(p.content), alternates: { canonical: `/novini/${p.slug}` }, openGraph: p.coverUrl ? { images: [p.coverUrl], type: "article" } : { type: "article" } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p || !p.publishedAt || p.publishedAt > new Date()) notFound();
  return (
    <Section className="!pt-10 !pb-16">
      <article className="max-w-[800px] mx-auto">
        <p className="text-center"><Link href="/novini" className="bb-more">Всички новини</Link></p>
        <div className="text-center mt-6">
          <WaveTitle as="h1">{p.title}</WaveTitle>
          <p className="mx-auto text-[#666]">{formatDate(p.publishedAt)}</p>
        </div>
        {p.coverUrl && <img src={cld(p.coverUrl, 1200)} alt="" className="mt-8 rounded-2xl w-full object-cover" />}
        <div className="prose lead mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
      </article>
    </Section>
  );
}
