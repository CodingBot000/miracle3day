import { NextResponse } from 'next/server'
import { q } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface LogRequestBody {
  query: string
  resultCount: number
  userId?: string
}

export async function POST(request: Request) {
  try {
    const body: LogRequestBody = await request.json()
    const { query, resultCount, userId } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    await q(
      `INSERT INTO search_logs (query, result_count, user_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [query.trim(), resultCount ?? 0, userId ?? null]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Search Log] Error:', error)
    // Return success anyway - logging failures shouldn't affect user experience
    return NextResponse.json({ success: false })
  }
}
