// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // 1. Daftar halaman yang BOLEH diakses oleh publik (tanpa login)
  // Root ("/") adalah halaman Beranda publik
  const isPublicPath = pathname === "/" || pathname.startsWith("/login");

  // 2. Jika TIDAK ada token DAN mencoba masuk ke halaman selain daftar publik di atas
  if (!token && !isPublicPath) {
    // UBAH DI SINI: Arahkan ke root "/" (Beranda) alih-alih "/login"
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Jika SUDAH login tapi malah mencoba buka halaman login
  if (token && pathname.startsWith("/login")) {
    // Arahkan langsung ke halaman dasbor
    return NextResponse.redirect(new URL("/dasbor", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Jalankan middleware ini di semua rute, KECUALI file sistem Next.js dan API
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};