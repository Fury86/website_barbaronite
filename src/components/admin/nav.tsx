"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Palette, Users, CalendarDays, PartyPopper, Newspaper, FileText, Settings,
  UserCog, ClipboardList, MessageSquare, Images, KeyRound, History,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Табло", icon: LayoutDashboard, exact: true },
  { href: "/admin/registrations", label: "Записвания", icon: ClipboardList },
  { href: "/admin/inquiries", label: "Запитвания", icon: MessageSquare },
  { href: "/admin/activities", label: "Дейности", icon: Palette },
  { href: "/admin/team", label: "Екип", icon: Users },
  { href: "/admin/schedule", label: "Програма", icon: CalendarDays },
  { href: "/admin/events", label: "Събития", icon: PartyPopper },
  { href: "/admin/news", label: "Новини", icon: Newspaper },
  { href: "/admin/texts", label: "Текстове", icon: FileText },
  { href: "/admin/media", label: "Снимки", icon: Images },
  { href: "/admin/settings", label: "Настройки", icon: Settings, admin: true },
  { href: "/admin/users", label: "Потребители", icon: UserCog, admin: true },
  { href: "/admin/log", label: "Дневник", icon: History, admin: true },
  { href: "/admin/profile", label: "Моята парола", icon: KeyRound },
];

export function AdminNav({ role, badges }: { role: "admin" | "editor"; badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav className="admin-nav grid gap-0.5" aria-label="Панел">
      {items
        .filter((i) => !i.admin || role === "admin")
        .map((i) => {
          const current = i.exact ? path === i.href : path.startsWith(i.href);
          const n = badges[i.href];
          return (
            <Link key={i.href} href={i.href} aria-current={current ? "page" : undefined}>
              <i.icon size={18} strokeWidth={2.2} aria-hidden />
              <span className="flex-1">{i.label}</span>
              {n ? <span className={`badge ${current ? "bg-white/20 text-white" : "bg-coral text-white"}`}>{n}</span> : null}
            </Link>
          );
        })}
    </nav>
  );
}
