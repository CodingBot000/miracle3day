/**
 * Badge API Route
 * GET /api/gamification/badges - Get all badge definitions
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAllBadges, getUserBadges } from '@/services/badges';

export async function GET(req: NextRequest) {
  try {
    // Get user ID from header (temporary - replace with proper auth)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      // If no user ID, return all badge definitions
      const badges = await getAllBadges();
      return NextResponse.json({
        success: true,
        badges,
      });
    }

    // If user ID provided, return user's badges
    const userBadges = await getUserBadges(userId);
    const allBadges = await getAllBadges();

    return NextResponse.json({
      success: true,
      allBadges,
      userBadges,
      totalEarned: userBadges.length,
      totalAvailable: allBadges.length,
    });
  } catch (error) {
    console.error('[BadgesAPI] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch badges',
      },
      { status: 500 }
    );
  }
}
