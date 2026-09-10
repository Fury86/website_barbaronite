import type { Metadata } from "next";
import { getBlocks, getSettings } from "@/lib/data";
import { SiteFooter, SiteHeader } from "@/components/site/shell";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.barbaronite.eu";
  return {
    metadataBase: new URL(base),
    title: { default: s.meta_title, template: `%s – ${s.site_name}` },
    description: s.meta_description,
    openGraph: { siteName: s.site_name, locale: "bg_BG", type: "website" },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, blocks] = await Promise.all([getSettings(), getBlocks("Общи")]);
  return (
    <div className="site">
      <SiteHeader siteName={s.site_name} phone={s.phone} />
      <main>{children}</main>
      <SiteFooter s={s} footerText={blocks["footer.text"] || s.tagline} />
    </div>
  );
}
