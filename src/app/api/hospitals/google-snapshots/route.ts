/**
 * POST /api/hospitals/google-snapshots
 * Returns Google review snapshots (rating, reviewCount) for multiple hospitals
 *
 * Request Body:
 *   { hospitalIds: string[] }
 *
 * Response:
 *   { snapshots: { [hospitalId: string]: { rating: number | null, userRatingCount: number | null } } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSnapshotsByHospitalIds } from '@/server/googleReviews/repo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hospitalIds } = body;

    if (!Array.isArray(hospitalIds) || hospitalIds.length === 0) {
      return NextResponse.json(
        { error: 'hospitalIds array is required' },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (hospitalIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 hospital IDs allowed' },
        { status: 400 }
      );
    }

    const snapshotsMap = await getSnapshotsByHospitalIds(hospitalIds);

    // Convert Map to plain object for JSON serialization
    const snapshots: Record<string, { rating: number | null; userRatingCount: number | null }> = {};
    for (const [id, data] of snapshotsMap) {
      snapshots[id] = data;
    }

    return NextResponse.json(
      { snapshots },
      {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5분 캐시
        },
      }
    );
  } catch (error) {
    console.error('[POST /api/hospitals/google-snapshots] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}
