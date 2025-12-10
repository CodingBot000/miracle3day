import { NextRequest, NextResponse } from 'next/server';
import { sendPushToMember } from '@/lib/fcm-push';
import { PushType } from '@/models/fcm.dto';

export async function POST(req: NextRequest) {
  try {
    const { memberId, pushType } = await req.json();

    if (!memberId || !pushType) {
      return NextResponse.json(
        { error: 'memberId and pushType are required' },
        { status: 400 }
      );
    }

    const result = await sendPushToMember(memberId, pushType as PushType, {
      testData: 'This is a test push',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[FCM Test Error]', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}
