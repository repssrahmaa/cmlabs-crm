import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { RoleType } from "@/lib/permissions"

// ── Route permission matrix ────────────────────────────────────
const ROUTE_PERMISSIONS: {
  pattern:       RegExp
  allow:         RoleType[]
  redirectViewer?: boolean   // redirect VIEWER ke read-only version
}[] = [
  // Forecasting — management only
  {
    pattern: /^\/forecasting/,
    allow:   ["SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
  // Team management — admin only
  {
    pattern: /^\/team/,
    allow:   ["SUPER_ADMIN", "SALES_MANAGER", "EXECUTIVE"],
  },
  // Reports — management only
  {
    pattern: /^\/reports/,
    allow:   ["SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
  // Leads — semua bisa akses, tapi VIEWER read-only (handle di UI)
  {
    pattern:         /^\/leads/,
    allow:           ["SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE", "VIEWER"],
    redirectViewer:  false,  // biarkan masuk, UI akan handle read-only
  },
  // Mailing — semua kecuali VIEWER dan EXECUTIVE
  {
    pattern: /^\/mails/,
    allow:   ["SUPER_ADMIN", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  },
  // Dashboard — semua role bisa akses
  {
    pattern: /^\/dashboard/,
    allow:   ["SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE", "VIEWER"],
  },
  // Profile — semua role bisa akses
  {
    pattern: /^\/profile/,
    allow:   ["SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE", "VIEWER"],
  },
]

// ── Helper: cari rule yang cocok ──────────────────────────────
function findRouteRule(pathname: string) {
  return ROUTE_PERMISSIONS.find((rule) => rule.pattern.test(pathname))
}

// ── Helper: build unauthorized URL ────────────────────────────
function buildUnauthorizedUrl(
  base:          URL,
  from:          string,
  requiredRoles: RoleType[]
): URL {
  const url = new URL("/unauthorized", base)
  url.searchParams.set("from", from)
  url.searchParams.set("required", requiredRoles[0] ?? "SALES_MANAGER")
  return url
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session      = req.auth
  const isLoggedIn   = !!session?.user

  // ── Skip static assets dan API auth ───────────────────────
  const isStaticAsset = /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/.test(pathname)
  const isApiAuth     = pathname.startsWith("/api/auth")
  const isApiRoute    = pathname.startsWith("/api/")
  const isPublicPage  = pathname === "/login" ||
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

  // ── Skip API routes (handled di route handler) ────────────
  if (isApiRoute || isPublicPage || !isLoggedIn) {
    return NextResponse.next()
  }

  // ── Role-based route protection ───────────────────────────
  const userRole = session?.user?.role as RoleType | undefined
  if (!userRole) return NextResponse.next()

  const rule = findRouteRule(pathname)
  if (!rule) return NextResponse.next()  // tidak ada rule → izinkan

  // Cek apakah role ada di allow list
  const isAllowed = rule.allow.includes(userRole)

  if (!isAllowed) {
    // VIEWER mencoba akses edit routes → arahkan ke unauthorized
    const unauthorizedUrl = buildUnauthorizedUrl(
      req.nextUrl,
      pathname,
      rule.allow
    )

    return NextResponse.redirect(unauthorizedUrl)
  }
 console.log("PROXY RUNNING:", pathname)
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match semua request path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}