"use client"

import { Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import type { RoleType } from "@/lib/permissions"

const ROLE_LABEL: Record<RoleType, string> = {
  SUPER_ADMIN: "Super Admin",
  EXECUTIVE: "Executive",
  SALES_MANAGER: "Sales Manager",
  ACCOUNT_EXECUTIVE: "Account Executive",
  VIEWER: "Viewer",
}

const ROLE_COLOR: Record<RoleType, { color: string; bg: string }> = {
  SUPER_ADMIN: { color: "#dc2626", bg: "#fef2f2" },
  EXECUTIVE: { color: "#7c3aed", bg: "#f5f3ff" },
  SALES_MANAGER: { color: "#2563eb", bg: "#eff6ff" },
  ACCOUNT_EXECUTIVE: { color: "#059669", bg: "#ecfdf5" },
  VIEWER: { color: "#64748b", bg: "#f8fafc" },
}

function UnauthorizedContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  const from = searchParams.get("from") ?? "halaman tersebut"
  const requiredRole = searchParams.get("required") as RoleType | null
  const userRole = session?.user?.role as RoleType | undefined

  const roleCfg = userRole ? ROLE_COLOR[userRole] : null

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 48,
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#fef2f2",
            border: "2px solid #fecaca",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 20px",
          }}
        >
          🔒
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 8px",
          }}
        >
          Akses Ditolak
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            margin: "0 0 28px",
            lineHeight: 1.6,
          }}
        >
          Anda tidak memiliki akses ke halaman{" "}
          <strong style={{ color: "#0f172a" }}>{from}</strong>.
        </p>

        {userRole && roleCfg && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 10,
              padding: "16px 20px",
              marginBottom: 20,
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#94a3b8",
                marginBottom: 8,
              }}
            >
              Role Anda saat ini
            </div>

            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "4px 14px",
                borderRadius: 999,
                background: roleCfg.bg,
                color: roleCfg.color,
              }}
            >
              {ROLE_LABEL[userRole]}
            </span>
          </div>
        )}

        {requiredRole && (
          <div
            style={{
              background: "#fffbeb",
              borderRadius: 10,
              padding: "16px 20px",
              marginBottom: 28,
              border: "1px solid #fde68a",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#92400e",
                marginBottom: 8,
              }}
            >
              Minimal role yang dibutuhkan
            </div>

            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "4px 14px",
                borderRadius: 999,
                background: "#fef3c7",
                color: "#d97706",
              }}
            >
              {ROLE_LABEL[requiredRole] ?? requiredRole}
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              padding: "10px 20px",
              background: "#f1f5f9",
              color: "#475569",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Kembali
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "10px 24px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnauthorizedContent />
    </Suspense>
  )
}