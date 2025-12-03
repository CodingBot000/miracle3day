import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import AnswerList from './AnswerList';
import AnswerForm from './AnswerForm';
import { getAuthSession } from '@/lib/auth-helper';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

type MultiLingualField = string | { [key: string]: string } | null | undefined;

function getLocalizedText(field: MultiLingualField, language: string) {
  if (!field) return '';
  if (typeof field === 'string') return field;

  const normalizedLang = (language || '').toLowerCase();
  return (
    (normalizedLang ? field[normalizedLang] : '') ||
    field.en ||
    field.ko ||
    ''
  );
}

async function fetchQuestion(id: string, lang: string = 'ko') {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/community/daily-questions?date=all&lang=${lang}`, {
      cache: 'no-store'
    });

    const data = await res.json();
    const { questions } = data;

    // DB에서 id가 문자열로 반환되므로 문자열로 비교
    const question = questions?.find((q: any) => q.id === id || q.id === parseInt(id));

    return question || null;
  } catch (error) {
    console.error('Fetch question error:', error);
    return null;
  }
}

async function fetchAnswers(questionId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/community/daily-questions/${questionId}/answers`, {
      cache: 'no-store'
    });

    if (!res.ok) return [];

    const { answers } = await res.json();
    return answers || [];
  } catch (error) {
    console.error('Fetch answers error:', error);
    return [];
  }
}

export default async function QuestionDetailPage({
  params
}: {
  params: { id: string }
}) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("app_session");
  const isAuthenticated = !!sessionCookie;

  // Get language from next-intl
  const locale = await getLocale();
  const language = locale === 'ko' ? 'ko' : 'en';

  // Get current user UUID for edit permissions
  let currentUserUuid: string | null = null;
  if (isAuthenticated) {
    try {
      const authSession = await getAuthSession({ headers: { cookie: cookieStore.toString() } } as any);
      if (authSession) {
        const member = await findMemberByUserId(authSession.userId);
        currentUserUuid =
          (member?.['uuid'] as string | undefined) ??
          (member?.['id_uuid'] as string | undefined) ??
          authSession.userId;
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  }

  const question = await fetchQuestion(params.id, language);

  if (!question) {
    notFound();
  }

  const answers = await fetchAnswers(params.id);

  const typeColors = {
    poll: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-800' },
    situation: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-800' },
    open: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-800' }
  };

  const colors = typeColors[question.id_category as keyof typeof typeColors] || typeColors.open;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 질문 카드 */}
      <div className={`${colors.bg} border-l-4 ${colors.border} rounded-xl p-6 mb-6 shadow-md`}>
        {/* 배지 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`${colors.bg} ${colors.text} text-xs font-bold px-3 py-1.5 rounded-full border ${colors.border}`}>
            {question.id_category === 'poll' && '📊 투표'}
            {question.id_category === 'situation' && '🎭 상황별'}
            {question.id_category === 'open' && '💬 Q&A'}
          </span>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1.5 rounded-full">
            +{question.points_reward} 포인트
          </span>
          {question.difficulty && (
            <span className="bg-blue-100 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {language === 'ko' ? `난이도: ${question.difficulty}` : `Difficulty: ${question.difficulty}`}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
          {getLocalizedText(question.title, language)}
        </h1>

        {/* 부제목 */}
        {question.subtitle && (
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            {getLocalizedText(question.subtitle, language)}
          </p>
        )}

        {/* 상황 설명 */}
        {question.situation_context && (
          <div className="bg-white/50 border-l-4 border-orange-500 p-4 rounded-lg mt-4">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {getLocalizedText(question.situation_context, language)}
            </div>
          </div>
        )}

        {/* 통계 */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-300/50 text-sm text-gray-600">
          <span>{language === 'ko' ? '👁️ 조회' : '👁️ Views'} {question.view_count || 0}</span>
          <span>{language === 'ko' ? '💬 답변' : '💬 Answers'} {question.answer_count || 0}</span>
          <span className="text-gray-400">
            {new Date(question.created_at).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>

      {/* 답변 작성 폼 */}
      {question.id_category !== 'poll' && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{language === 'ko' ? '💬 답변 작성하기' : '💬 Write Answer'}</h2>
          <AnswerForm questionId={question.id} pointsReward={question.points_reward} isAuthenticated={isAuthenticated} />
        </div>
      )}

      {/* 답변 목록 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'ko' ? '💭 답변' : '💭 Answers'} {answers.length}
          </h2>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="best">{language === 'ko' ? '베스트순' : 'Best'}</option>
            <option value="latest">{language === 'ko' ? '최신순' : 'Latest'}</option>
            <option value="likes">{language === 'ko' ? '좋아요순' : 'Likes'}</option>
          </select>
        </div>

        <AnswerList answers={answers} questionId={question.id} currentUserUuid={currentUserUuid} />
      </div>
    </div>
  );
}
