'use client';

import { useState, useEffect } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import RoutineCarousel from './components/RoutineCarousel';
import {
  BASIC_TEMPLATE,
  INTERMEDIATE_TEMPLATE,
  ADVANCED_TEMPLATE,
  RoutineTemplate
} from '@/lib/skincare/routineTemplates';
import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';

export interface RoutineData {
  type: 'basic' | 'intermediate' | 'advanced';
  name: string;
  description: string;
  totalSteps: number;
  estimatedTime: string;
  morning: RoutineStep[];
  midday: RoutineStep[];
  evening: RoutineStep[];
}

export interface RoutineStep {
  order: number;
  name: string;
  type: string;
  reason?: string;
  ingredients?: string[];
}

export default function RecommendRoutinePage() {
  const { navigate } = useNavigation();

  // 3가지 루틴 데이터
  const [routines, setRoutines] = useState<{
    basic: RoutineData | null;
    intermediate: RoutineData | null;
    advanced: RoutineData | null;
  }>({
    basic: null,
    intermediate: null,
    advanced: null
  });

  // 선택된 루틴
  const [selectedRoutine, setSelectedRoutine] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 확인 버튼 로딩
  const [isConfirming, setIsConfirming] = useState(false);

  // 페이지 로드 시 3가지 루틴 병렬 생성
  useEffect(() => {
    const generateAllRoutines = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 약간의 딜레이 (스켈레톤 UI 표시용)
        await new Promise(resolve => setTimeout(resolve, 800));

        // 3가지 루틴 병렬 생성 (클라이언트에서 직접)
        const [basicData, intermediateData, advancedData] = await Promise.all([
          generateRoutineLocally('basic'),
          generateRoutineLocally('intermediate'),
          generateRoutineLocally('advanced')
        ]);

        setRoutines({
          basic: basicData,
          intermediate: intermediateData,
          advanced: advancedData
        });

      } catch (err) {
        console.error('Error generating routines:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate routines');
      } finally {
        setIsLoading(false);
      }
    };

    generateAllRoutines();
  }, []);

  // 클라이언트에서 루틴 생성
  const generateRoutineLocally = async (
    type: 'basic' | 'intermediate' | 'advanced'
  ): Promise<RoutineData> => {
    const templateMap: Record<string, RoutineTemplate> = {
      basic: BASIC_TEMPLATE,
      intermediate: INTERMEDIATE_TEMPLATE,
      advanced: ADVANCED_TEMPLATE
    };

    const template = templateMap[type];

    const routineNames = {
      basic: 'Basic Routine',
      intermediate: 'Intermediate Routine',
      advanced: 'Advanced Routine'
    };

    const routineDescriptions = {
      basic: 'Perfect for beginners or busy lifestyles',
      intermediate: 'Balanced routine with targeted treatments',
      advanced: 'Comprehensive multi-step ritual'
    };

    const timeEstimates = {
      basic: '< 7 min',
      intermediate: '8-12 min',
      advanced: '15-20 min'
    };

    const convertSteps = (steps: typeof template.morning): RoutineStep[] => {
      return steps.map(step => ({
        order: step.step_order,
        name: step.step_name,
        type: step.step_type,
        reason: step.recommendation_reason,
        ingredients: step.recommended_ingredients
      }));
    };

    return {
      type,
      name: routineNames[type],
      description: routineDescriptions[type],
      totalSteps: template.morning.length + template.midday.length + template.evening.length,
      estimatedTime: timeEstimates[type],
      morning: convertSteps(template.morning),
      midday: convertSteps(template.midday),
      evening: convertSteps(template.evening)
    };
  };

  // 확인 버튼: 선택한 루틴만 DB 저장
  const handleConfirmSelection = async () => {
    if (!selectedRoutine) return;

    setIsConfirming(true);

    try {
      const userUuid = getUserUuid();

      if (!userUuid) {
        throw new Error('User UUID not found');
      }

      // DB에 루틴 저장
      const response = await fetch('/api/skincare/routines/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_uuid: userUuid,
          routine_type: selectedRoutine
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save routine');
      }

      const result = await response.json();
      const routineUuid = result.routine_uuid;

      console.log('✅ Routine saved to DB:', { type: selectedRoutine, uuid: routineUuid });

      // view-routine 페이지로 이동
      navigate(`/skincare-onboarding/view-routine?routine_uuid=${routineUuid}`);

    } catch (err) {
      console.error('❌ Error saving routine:', err);
      setError(err instanceof Error ? err.message : 'Failed to save routine');
      setIsConfirming(false);
    }
  };

  // 에러 화면
  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4 text-center">
        <h1 className="text-xl font-bold text-gray-900">Choose Your Routine</h1>
        <p className="text-sm text-gray-600 mt-1">
          Swipe to compare and select the best fit for you
        </p>
      </div>

      {/* 캐러셀 영역 */}
      <div className="flex-1 overflow-hidden">
        <RoutineCarousel
          routines={routines}
          selectedRoutine={selectedRoutine}
          onSelectRoutine={setSelectedRoutine}
          isLoading={isLoading}
        />
      </div>

      {/* 하단 고정 영역 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        {selectedRoutine && routines[selectedRoutine] && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">Selected:</p>
            <p className="text-base font-semibold text-gray-900">
              {routines[selectedRoutine]!.name} ({routines[selectedRoutine]!.totalSteps} steps)
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mb-3">
            <p className="text-sm text-gray-500">Generating personalized routines...</p>
          </div>
        )}

        <button
          onClick={handleConfirmSelection}
          disabled={isLoading || isConfirming}
          className={`
            w-full py-4 rounded-xl font-semibold text-white transition-all
            ${!isLoading && !isConfirming
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          {isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : isLoading ? (
            'Loading...'
          ) : (
            'Confirm & Continue'
          )}
        </button>
      </div>
    </div>
  );
}

function getUserUuid(): string {
  const stored = mobileStorage.getRaw(STORAGE_KEYS.SKINCARE_ONBOARDING_ANSWERS);
  if (stored) {
    const data = JSON.parse(stored);
    return data.id_uuid || '';
  }
  return '';
}
