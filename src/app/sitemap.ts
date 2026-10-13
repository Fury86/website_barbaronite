import type { MetadataRoute } from "next";
import { getPublishedPosts, getUpcomingEvents, getPastEvents, getVisibleActivities } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.barbaronite.eu";
  const [acts, up, past, posts] = await Promise.all([getVisibleActivities(), getUpcomingEvents(), getPastEvents(100), getPublishedPosts()]);
  const staticPages = ["", "/za-nas", "/deynosti", "/programa", "/sabitiya", "/novini", "/kontakti", "/zapisvane"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...acts.map((a) => ({ url: `${base}/deynosti/${a.slug}`, lastModified: a.updatedAt, priority: 0.8 })),
    ...[...up, ...past].map((e) => ({ url: `${base}/sabitiya/${e.slug}`, lastModified: e.updatedAt, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${base}/novini/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
  ];
}
