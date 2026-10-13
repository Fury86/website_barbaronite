import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Пазач на /admin:
 * – без база данни (DATABASE_URL) всичко под /admin показва страницата с инструкции /admin/db;
 * – без сесийна бисквитка → към входа. Истинската проверка на сесията е в layout-а на панела.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (!process.env.DATABASE_URL) {
    if (pathname === "/admin/db") return NextResponse.next();
    url.pathname = "/admin/db";
    url.search = "";
    return NextResponse.rewrite(url);
  }
  if (pathname === "/admin/db") {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  const open = pathname === "/admin/login" || pathname === "/admin/setup";
  if (!open && !request.cookies.get("bb_session")) {
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
