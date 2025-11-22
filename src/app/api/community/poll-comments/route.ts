import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helper';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';
import { createPollComment } from '@/services/pollComments';

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const authSession = await getAuthSession(req);
    if (!authSession) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 멤버 UUID 조회
    const member = await findMemberByUserId(authSession.userId);
    const memberUuid = member?.uuid || member?.id_uuid || authSession.userId;

    // 요청 바디 파싱
    const { questionId, content, parentId, isAnonymous } = await req.json();

    // 유효성 검사
    if (!questionId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 댓글 생성
    const comment = await createPollComment(
      questionId,
      memberUuid,
      content.trim(),
      parentId,
      isAnonymous || false
    );

    if (!comment) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('POST /api/community/poll-comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

