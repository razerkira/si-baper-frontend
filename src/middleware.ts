// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/beranda", request.url));
  }

  const isLoginPage = pathname.startsWith("/login");
  const isBerandaPage = pathname.startsWith("/beranda");

  if (!token && !isLoginPage && !isBerandaPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};