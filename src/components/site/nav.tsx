"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "./nav-items";

export function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return (
    <>
      <button type="button" className={`bb-burger ${open ? "open" : ""}`} aria-expanded={open} aria-controls="site-nav" aria-label={open ? "Затвори меню" : "Отвори меню"} onClick={() => setOpen((v) => !v)}>
        <span /><span /><span />
      </button>
      <nav id="site-nav" className={`bb-nav ${open ? "open" : ""}`} aria-label="Основна навигация">
        {NAV.map((n) => {
          const current = path === n.href || path.startsWith(n.href + "/");
          return <Link key={n.href} href={n.href} aria-current={current ? "page" : undefined}>{n.label}</Link>;
        })}
      </nav>
    </>
  );
}
