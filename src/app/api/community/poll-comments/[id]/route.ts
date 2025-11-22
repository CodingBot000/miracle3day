import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helper';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';
import { deletePollComment } from '@/services/pollComments';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const commentId = parseInt(params.id);

    // 댓글 삭제
    const success = await deletePollComment(commentId, memberUuid);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete comment or unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/community/poll-comments/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

