/**
 * Daily Check-in API Route
 * POST /api/community/checkin - Process daily check-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { processCheckin } from '@/services/badges';

export async function POST(req: NextRequest) {
  try {
    // TODO: Replace with actual authentication logic
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const result = await processCheckin(userId);

    if (!result.success) {
      if (result.alreadyCheckedIn) {
        return NextResponse.json(
          {
            success: false,
            error: 'Already checked in today',
            alreadyCheckedIn: true,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process check-in',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in successful!',
      streak: result.streak,
      notifications: result.notifications,
    });
  } catch (error) {
    console.error('[CheckinAPI] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process check-in',
      },
      { status: 500 }
    );
  }
}
