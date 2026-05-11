import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getLeadTimeline } from "@/lib/services/activityService"

// GET /api/leads/[id]/timeline
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const timeline = await getLeadTimeline(id)
    return NextResponse.json(timeline)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}