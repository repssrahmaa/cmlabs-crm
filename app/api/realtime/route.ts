import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { RoleType } from "@/lib/permissions"

// ── Global subscriber map ──────────────────────────────────────
// Map<userId, Set<ReadableStreamController>>
const subscribers = new Map<string, Set<ReadableStreamDefaultController>>()

// ── Broadcast ke semua subscriber ─────────────────────────────
export function broadcastUpdate(event: string, data: unknown) {
  subscribers.forEach((controllers) => {
    controllers.forEach((controller) => {
      try {
        controller.enqueue(
          `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        )
      } catch {
        // Controller sudah closed — abaikan
      }
    })
  })
}

// ── Broadcast ke user tertentu ─────────────────────────────────
export function broadcastToUser(
  userId: string,
  event:  string,
  data:   unknown
) {
  const controllers = subscribers.get(userId)
  if (!controllers) return

  controllers.forEach((controller) => {
    try {
      controller.enqueue(
        `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
      )
    } catch {
      // abaikan
    }
  })
}

// ── GET /api/realtime — SSE connection ─────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const role   = session.user.role as RoleType

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Tambahkan controller ke subscribers
      if (!subscribers.has(userId)) {
        subscribers.set(userId, new Set())
      }
      subscribers.get(userId)!.add(controller)

      // Kirim initial ping
      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({
            userId,
            role,
            timestamp: new Date().toISOString(),
          })}\n\n`
        )
      )

      // Heartbeat setiap 30 detik agar koneksi tidak putus
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`: heartbeat\n\n`)
          )
        } catch {
          clearInterval(heartbeat)
        }
      }, 30_000)

      // Cleanup saat koneksi ditutup
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat)
        subscribers.get(userId)?.delete(controller)
        if (subscribers.get(userId)?.size === 0) {
          subscribers.delete(userId)
        }
        try { controller.close() } catch { /* abaikan */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type":                "text/event-stream",
      "Cache-Control":               "no-cache, no-transform",
      "Connection":                  "keep-alive",
      "X-Accel-Buffering":           "no",
      "Access-Control-Allow-Origin": "*",
    },
  })
}