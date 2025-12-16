import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import type { PopularResponse, PopularTerm } from '@/models/search'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get popular searches from the last 7 days
    const terms = await q<PopularTerm>(
      `SELECT
        LOWER(query) as term,
        COUNT(*)::integer as count
      FROM search_logs
      WHERE
        created_at > NOW() - INTERVAL '7 days' AND
        result_count > 0 AND
        LENGTH(query) >= 2
      GROUP BY LOWER(query)
      ORDER BY count DESC
      LIMIT 10`
    )

    return NextResponse.json<PopularResponse>({ terms })
  } catch (error) {
    console.error('[Search Popular] Error:', error)
    // Return empty array on error - popular searches are not critical
    return NextResponse.json<PopularResponse>({ terms: [] })
  }
}
