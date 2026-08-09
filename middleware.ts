import { NextRequest, NextResponse } from "next/server";

const legacyPortals: Array<[string, string]> = [
  ["/dashboard", "/user/dashboard"],
  ["/jobs", "/user/jobs"],
  ["/contracts", "/user/contracts"],
  ["/reviews", "/user/reviews"],
  ["/member", "/employer"],
  ["/community-admin", "/employer/community-admin"],
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = legacyPortals.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!match) return NextResponse.next();

  const [prefix, replacement] = match;
  const url = request.nextUrl.clone();
  url.pathname = `${replacement}${pathname.slice(prefix.length)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/contracts/:path*",
    "/reviews/:path*",
    "/member/:path*",
    "/community-admin/:path*",
  ],
};
