import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

interface TrackingRequestBody {
  id_uuid_hospital: string;
  id_uuid_member?: string | null;
  event_type: string;
  event_data: Record<string, any>;
  source?: string;
  session_id?: string;
  user_agent?: string;
  referrer_url?: string;
}

/**
 * POST /api/tracking/external-link
 * 병원 터치포인트 이벤트를 기록합니다.
 */
export async function POST(req: Request) {
  try {
    const body: TrackingRequestBody = await req.json();

    // 필수 필드 검증
    if (!body.id_uuid_hospital || !body.event_type || !body.event_data) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: id_uuid_hospital, event_type, event_data',
        },
        { status: 400 }
      );
    }

    // IP 주소 추출 (프록시 뒤에 있을 경우 x-forwarded-for 헤더 확인)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.headers.get('x-real-ip') || null;

    // DB에 이벤트 기록
    const result = await q(
      `
      INSERT INTO tracking_hospital_touchpoints (
        id_uuid_hospital,
        id_uuid_member,
        event_type,
        event_data,
        user_agent,
        ip_address,
        referrer_url,
        session_id,
        source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
      `,
      [
        body.id_uuid_hospital,
        body.id_uuid_member || null,
        body.event_type,
        JSON.stringify(body.event_data),
        body.user_agent || null,
        ipAddress,
        body.referrer_url || null,
        body.session_id || null,
        body.source || null,
      ]
    );

    const eventId = result[0]?.id;

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      eventId: eventId ? String(eventId) : undefined,
    });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to track event',
      },
      { status: 500 }
    );
  }
}
