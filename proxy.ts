import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { RoleType } from "@/lib/permissions"

// ── Route permission matrix ────────────────────────────────────
const ROUTE_PERMISSIONS: {
  pattern: RegExp
  allow: RoleType[]
}[] = [
  // Forecasting — management only
  {
    pattern: /^\/forecasting/,
    allow: ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
  // Team management — admin & management
  {
    pattern: /^\/team/,
    allow: ["ADMIN", "SALES_MANAGER", "EXECUTIVE"],
  },
  // Reports — management only
  {
    pattern: /^\/reports/,
    allow: ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
  // Leads — semua kecuali viewer
  {
    pattern: /^\/leads/,
    allow: ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
  // Mailing — semua kecuali VIEWER dan EXECUTIVE
  {
    pattern: /^\/mails/,
    allow: ["ADMIN", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
  // Dashboard — semua role bisa akses
  {
    pattern: /^\/dashboard/,
    allow: ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
  // Profile — semua role bisa akses
  {
    pattern: /^\/profile/,
    allow: ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
]

// ── Helper: cari rule yang cocok ──────────────────────────────
function findRouteRule(pathname: string) {
  return ROUTE_PERMISSIONS.find((rule) => rule.pattern.test(pathname))
}

// ── Helper: build unauthorized URL ────────────────────────────
function buildUnauthorizedUrl(
  base: URL,
  from: string,
  requiredRoles: RoleType[]
): URL {
  const url = new URL("/unauthorized", base)
  url.searchParams.set("from", from)
  url.searchParams.set("required", requiredRoles.join(",")) // Tampilkan semua role yang diperbolehkan
  return url
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isLoggedIn = !!session?.user

  // ── Skip static assets dan API auth ───────────────────────
  const isStaticAsset = /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/.test(pathname)
  const isApiAuth = pathname.startsWith("/api/auth")
  const isApiRoute = pathname.startsWith("/api/")
  const isPublicPage =
    pathname === "/login" ||
    pathname === "/unauthorized" ||
    pathname === "/"

  if (isStaticAsset || isApiAuth) return NextResponse.next()

  // ── Belum login ────────────────────────────────────────────
  if (!isLoggedIn && !isPublicPage && !isApiRoute) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Sudah login, akses halaman login ──────────────────────
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  // ── Root redirect ─────────────────────────────────────────
  if (pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // ── Skip API routes & Public Page ─────────────────────────
  if (isApiRoute || isPublicPage || !isLoggedIn) {
    return NextResponse.next()
  }

  // ── Role-based route protection ───────────────────────────
  // Normalisasi role ke UPPERCASE agar tidak error case-sensitivity
  const rawRole = session?.user?.role as string | undefined
  const userRole = rawRole?.toUpperCase() as RoleType | undefined

  // Jika user terautentikasi tapi tidak punya role di session -> Tendang ke unauthorized
  if (!userRole) {
    console.warn("[AUTH] User logged in but has no role assigned:", session?.user)
    return NextResponse.redirect(buildUnauthorizedUrl(req.nextUrl, pathname, ["ADMIN"]))
  }

  const rule = findRouteRule(pathname)
  if (!rule) return NextResponse.next() // tidak ada rule → izinkan

  // Cek apakah userRole ada di daftar allow
  const isAllowed = rule.allow.includes(userRole)

  if (!isAllowed) {
    console.warn(`[AUTH] Access Denied for role ${userRole} on ${pathname}`)
    const unauthorizedUrl = buildUnauthorizedUrl(
      req.nextUrl,
      pathname,
      rule.allow
    )
    return NextResponse.redirect(unauthorizedUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}