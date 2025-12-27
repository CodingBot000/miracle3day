/**
 * 스킨케어 온보딩 단계별 유효성 검증 함수
 *
 * 각 질문 단계에서 Next 버튼 활성화 여부를 결정
 */

import { SkincareOnboardingDTO } from '@/models/skincare-onboarding.dto';

/**
 * 질문 데이터 타입
 */
interface QuestionData {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'single_choice_with_search';
  skip_allowed?: boolean;
  max_selections?: number;
}

/**
 * 단계별 답변 유효성 검증
 *
 * @param questionData - 질문 데이터
 * @param answer - 사용자 답변
 * @returns true = Next 버튼 활성화, false = 비활성화
 */
export function validateStep(
  questionData: QuestionData,
  answer: string | string[] | null | undefined
): boolean {
  // 건너뛰기가 허용된 질문은 항상 true (답변 없어도 다음으로 이동 가능)
  if (questionData.skip_allowed) {
    return true;
  }

  // 답변이 없는 경우
  if (answer === null || answer === undefined || answer === '') {
    return false;
  }

  // 질문 타입별 검증
  switch (questionData.type) {
    case 'single_choice':
    case 'single_choice_with_search':
      // 단일 선택: 문자열이 비어있지 않아야 함
      return typeof answer === 'string' && answer.trim().length > 0;

    case 'multiple_choice':
      // 다중 선택: 배열이어야 하고 최소 1개 이상 선택되어야 함
      return Array.isArray(answer) && answer.length > 0;

    default:
      // 알 수 없는 타입은 false 반환
      return false;
  }
}

/**
 * 국가 선택 단계 유효성 검증
 *
 * @param countryCode - 선택된 국가 코드
 * @returns true = Next 버튼 활성화, false = 비활성화
 */
export function validateCountryStep(countryCode: string | null | undefined): boolean {
  // 국가 코드가 선택되었는지 확인
  return countryCode !== null && countryCode !== undefined && countryCode.trim().length > 0;
}

/**
 * 모든 필수 질문에 답변했는지 확인 (완료 화면으로 이동 가능 여부)
 *
 * @param answers - 사용자 답변 객체
 * @param questions - 전체 질문 데이터
 * @returns true = 완료 가능, false = 아직 답변 필요
 */
export function validateAllSteps(
  answers: Partial<SkincareOnboardingDTO>,
  questions: QuestionData[]
): boolean {
  // 필수 질문들만 필터링
  const requiredQuestions = questions.filter((q) => !q.skip_allowed);

  // 모든 필수 질문에 답변했는지 확인
  for (const question of requiredQuestions) {
    const answer = answers[question.id as keyof SkincareOnboardingDTO];

    if (!validateStep(question, answer as any)) {
      return false;
    }
  }

  return true;
}

/**
 * 특정 질문 ID의 답변 유효성 검증
 *
 * @param questionId - 질문 ID (예: 'age_group', 'gender', 'country_code')
 * @param answer - 사용자 답변
 * @param skipAllowed - 건너뛰기 허용 여부
 * @returns true = 유효함, false = 유효하지 않음
 */
export function validateAnswer(
  questionId: string,
  answer: string | string[] | null | undefined,
  skipAllowed: boolean = false
): boolean {
  // 건너뛰기가 허용된 경우 항상 유효
  if (skipAllowed) {
    return true;
  }

  // 답변이 없는 경우
  if (answer === null || answer === undefined) {
    return false;
  }

  // 문자열인 경우
  if (typeof answer === 'string') {
    return answer.trim().length > 0;
  }

  // 배열인 경우 (다중 선택)
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return false;
}
