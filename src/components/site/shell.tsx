import Link from "next/link";
import { Mail, MapPin, Phone, PhoneCall } from "lucide-react";
import { SiteNav } from "./nav";
import { NAV } from "./nav-items";

const LOGO = "https://res.cloudinary.com/dk4bzhxfg/image/upload/f_auto,q_auto,w_360/v1760971859/barbaronite_logo_bhkpkt.png";

export function SiteHeader({ siteName, phone }: { siteName: string; phone: string }) {
  return (
    <header className="bb-header">
      <div className="wrap">
        <Link href="/" className="brand">{siteName}</Link>
        <SiteNav />
        <Link href="/kontakti" className="bb-contact" aria-label={`Контакти, телефон ${phone}`}>
          <PhoneCall size={20} aria-hidden />
          <span className="label">Контакти</span>
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter({ s, footerText }: { s: Record<string, string>; footerText: string }) {
  const social = [
    { href: s.facebook, label: "Facebook" },
    { href: s.instagram, label: "Instagram" },
    { href: s.youtube, label: "YouTube" },
  ].filter((x) => x.href);
  return (
    <footer className="bb-footer">
      <div className="cols">
        <div className="logo">
          <img src={LOGO} alt={`${s.site_name} лого`} width={180} height={180} />
          <p>{footerText}</p>
        </div>
        <nav className="col" aria-label="Навигация в долната част">
          <h4>Навигация</h4>
          <ul className="grid gap-2">
            {NAV.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}
            <li><Link href="/kontakti">Контакти</Link></li>
            <li><Link href="/zapisvane">Записване</Link></li>
          </ul>
        </nav>
        <div className="col contact">
          <h4>Контакти</h4>
          <p><MapPin size={18} className="shrink-0 mt-0.5" aria-hidden /><span>{s.address}</span></p>
          <p><Phone size={18} className="shrink-0 mt-0.5" aria-hidden /><a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a></p>
          <p><Mail size={18} className="shrink-0 mt-0.5" aria-hidden /><a href={`mailto:${s.email}`}>{s.email}</a></p>
          {social.length > 0 && (
            <div className="social">
              {social.map(({ href, label }) => <a key={label} href={href} target="_blank" rel="noopener">{label}</a>)}
            </div>
          )}
        </div>
      </div>
      <div className="bottom">
        <span>© {new Date().getFullYear()} {s.site_name} | Всички права запазени</span>
        <Link href="/admin">Вход за екипа</Link>
      </div>
    </footer>
  );
}

/** Заглавие с вълнистата лилава линия под него. */
export function WaveTitle({ children, as: Tag = "h2", stroke = "#7021A3" }: { children: React.ReactNode; as?: "h1" | "h2"; stroke?: string }) {
  return (
    <div className="bb-title">
      <Tag>{children}</Tag>
      <div className="bb-wave" aria-hidden>
        <svg viewBox="0 0 1359 91" preserveAspectRatio="none">
          <path d="M1358 28C1358 28 876 14 798 64C720 114 598 87 450 20C275.398 -59.0427 153.325 150.096 1.00006 64" stroke={stroke} strokeWidth="2.31" fill="none" />
        </svg>
      </div>
    </div>
  );
}

/** Вълниста линия през цялата ширина (между секциите). */
export function WaveDivider() {
  return (
    <svg className="bb-wave-full" viewBox="0 0 1359 91" preserveAspectRatio="none" aria-hidden>
      <path d="M1358 28C1358 28 876 14 798 64C720 114 598 87 450 20C275.398 -59.0427 153.325 150.096 1.00006 64" stroke="#7021A3" strokeWidth="2.31" fill="none" />
    </svg>
  );
}

export function Section({ children, className = "", id, sky = false }: { children: React.ReactNode; className?: string; id?: string; sky?: boolean }) {
  return (
    <section id={id} className={`bb-section ${sky ? "sky" : ""} ${className}`}>
      <div className="bb-container">{children}</div>
    </section>
  );
}

export function PageTitle({ title, intro, as = "h1" }: { title: string; intro?: string; as?: "h1" | "h2" }) {
  return (
    <div className="pt-6 md:pt-10 pb-8 text-center">
      <WaveTitle as={as}>{title}</WaveTitle>
      {intro && <p className="lead mx-auto mt-4 max-w-3xl text-center">{intro}</p>}
    </div>
  );
}
