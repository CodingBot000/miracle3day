import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/jwt';
import PollResultsContent from '@/components/community/PollResultsContent';
import { getPollQuestionById, getPollOptionsWithVotes, getUserPollVote } from '@/services/poll';
import { getPollComments } from '@/services/pollComments';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

export default async function PollResultsPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  // Next.js 15+에서는 params가 Promise일 수 있음
  const resolvedParams = await Promise.resolve(params);
  const questionId = parseInt(resolvedParams.id);

  if (!Number.isFinite(questionId) || questionId <= 0) {
    notFound();
    return;
  }

  // 병렬로 데이터 fetch
  const [question, options] = await Promise.all([
    getPollQuestionById(questionId),
    getPollOptionsWithVotes(questionId, null),
  ]);

  if (!question) {
    notFound();
    return;
  }

  // JWT 세션 확인
  const session = await getSessionUser();

  let userVote = null;
  let memberUuid: string | null = null;
  let isAuthenticated = false;

  if (session && session.status === 'active') {
    isAuthenticated = true;
    const member = await findMemberByUserId(session.id);
    memberUuid = member?.uuid || member?.id_uuid || session.id;

    // 사용자 투표 정보 가져오기
    if (memberUuid) {
      userVote = await getUserPollVote(questionId, memberUuid);
      // 사용자 투표 정보가 있으면 옵션 다시 가져오기 (is_selected_by_user 포함)
      if (userVote) {
        const optionsWithVote = await getPollOptionsWithVotes(questionId, memberUuid);
        // options 업데이트
        options.forEach((opt, idx) => {
          const votedOpt = optionsWithVote.find(o => o.id === opt.id);
          if (votedOpt) {
            options[idx] = votedOpt;
          }
        });
      }
    }
  }

  // 댓글 가져오기
  const comments = await getPollComments(questionId);

  return (
    <main className="poll-results-page">
      <Suspense fallback={<div>Loading...</div>}>
        <PollResultsContent
          question={question}
          options={options}
          userVote={userVote}
          initialComments={comments}
          isAuthenticated={isAuthenticated}
          memberUuid={memberUuid}
        />
      </Suspense>
    </main>
  );
}

// SEO 메타데이터
export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    // Next.js 15+에서는 params가 Promise일 수 있음
    const resolvedParams = await Promise.resolve(params);
    const questionId = parseInt(resolvedParams.id);

    if (!Number.isFinite(questionId) || questionId <= 0) {
      return { title: 'Poll Not Found - MimoTok Community' };
    }

    const question = await getPollQuestionById(questionId);

    if (!question) {
      return { title: 'Poll Not Found - MimoTok Community' };
    }

    const title = typeof question.title === 'string'
      ? question.title
      : question.title?.en || 'Poll Results';

    return {
      title: `${title} - MimoTok Community`,
      description: typeof question.subtitle === 'string'
        ? question.subtitle
        : question.subtitle?.en || 'View poll results and join the discussion',
    };
  } catch (error) {
    console.error('Error generating metadata for poll results:', error);
    return { title: 'Poll Results - MimoTok Community' };
  }
}
