/**
 * Zoom API Utility Functions
 *
 * Zoom Server-to-Server OAuth를 사용하여 미팅을 생성/삭제합니다.
 */

export interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  password: string;
  start_time: string;
  duration: number;
}

export class ZoomError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ZoomError';
  }
}

/**
 * Zoom Access Token 발급
 */
export async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new ZoomError('Zoom credentials are not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new ZoomError(
        `Failed to get Zoom access token: ${error}`,
        response.status
      );
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    if (error instanceof ZoomError) {
      throw error;
    }
    throw new ZoomError(
      'Failed to get Zoom access token',
      500,
      error
    );
  }
}

/**
 * Zoom Meeting 생성
 *
 * @param params.topic - 미팅 제목
 * @param params.startTime - 시작 시간 (ISO 8601 format)
 * @param params.duration - 미팅 시간 (분)
 */
export async function createZoomMeeting({
  topic,
  startTime,
  duration = 30,
}: {
  topic: string;
  startTime: string;
  duration?: number;
}): Promise<ZoomMeetingResponse> {
  const token = await getZoomAccessToken();

  try {
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration,
        timezone: 'Asia/Seoul',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true, // 의사 없어도 환자 입장 가능
          waiting_room: false, // 대기실 비활성화
          auto_recording: 'none', // 녹화 안 함
          mute_upon_entry: false, // 입장 시 음소거 안 함
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ZoomError(
        `Failed to create Zoom meeting: ${error}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ZoomError) {
      throw error;
    }
    throw new ZoomError(
      'Failed to create Zoom meeting',
      500,
      error
    );
  }
}

/**
 * Zoom Meeting 삭제
 *
 * @param meetingId - Zoom Meeting ID
 */
export async function deleteZoomMeeting(meetingId: string): Promise<void> {
  const token = await getZoomAccessToken();

  try {
    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 204 No Content 또는 404 Not Found는 성공으로 간주
    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new ZoomError(
        `Failed to delete Zoom meeting: ${error}`,
        response.status
      );
    }
  } catch (error) {
    if (error instanceof ZoomError) {
      throw error;
    }
    throw new ZoomError(
      'Failed to delete Zoom meeting',
      500,
      error
    );
  }
}

/**
 * Zoom Meeting 정보 조회
 */
export async function getZoomMeeting(meetingId: string): Promise<ZoomMeetingResponse> {
  const token = await getZoomAccessToken();

  try {
    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new ZoomError(
        `Failed to get Zoom meeting: ${error}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ZoomError) {
      throw error;
    }
    throw new ZoomError(
      'Failed to get Zoom meeting',
      500,
      error
    );
  }
}

/**
 * zoom_meeting_id가 유효한지 검사
 */
export function isValidZoomMeetingId(
  zoomMeetingId: string | null | undefined
): zoomMeetingId is string {
  return typeof zoomMeetingId === 'string' && zoomMeetingId.trim().length > 0;
}
