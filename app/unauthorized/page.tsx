"use client"

import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

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
            marginBottom: 10,
          }}
        >
          Akses Ditolak
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            marginBottom: 28,
          }}
        >
          Kamu tidak memiliki izin untuk membuka halaman ini.
        </p>

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
              cursor: "pointer",
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
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}