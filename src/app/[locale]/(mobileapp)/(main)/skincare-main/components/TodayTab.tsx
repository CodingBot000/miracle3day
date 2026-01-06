'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';
import WeeklySummary from './WeeklySummary';
import { ScoreBadge, ScoreDetailModal } from '@/app/[locale]/(mobileapp)/components/routine-score';
import { RoutineEditor, EditableStep } from '@/app/[locale]/(mobileapp)/components/routine-editor';
import {
  calculateRoutineScore,
  RoutineType,
  RoutineStep as ScoreRoutineStep
} from '@/lib/skincare/routineScoreCalculator';

interface RoutineStep {
  id_uuid: string;  // UUID로 변경 (serial id 제거)
  step_order: number;
  step_type: string;
  step_name: string;
  recommended_ingredients: string[];
  recommendation_reason: string;
  usage_frequency: string;
  is_enabled: boolean;
}

interface RoutineData {
  routine_uuid: string;
  id_uuid_member: string;
  morning_steps: RoutineStep[];
  midday_steps: RoutineStep[];
  evening_steps: RoutineStep[];
}

interface TodayTabProps {
  routine: RoutineData;
}

export default function TodayTab({ routine }: TodayTabProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'ko';

  // 로컬 루틴 데이터 상태 (편집 후 즉시 반영을 위해)
  const [localRoutine, setLocalRoutine] = useState<RoutineData>(routine);

  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Score 관련 상태
  const [isScoreHidden, setIsScoreHidden] = useState(false);
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [currentRoutineType, setCurrentRoutineType] = useState<RoutineType>('morning');

  // 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoutineType, setEditingRoutineType] = useState<RoutineType | null>(null);
  const [isEditSaving, setIsEditSaving] = useState(false);

  // 현재 시간에 따른 루틴 타입 자동 설정
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setCurrentRoutineType('morning');
    } else if (hour >= 12 && hour < 18) {
      setCurrentRoutineType('midday');
    } else {
      setCurrentRoutineType('evening');
    }
  }, []);

  // 현재 루틴 타입에 따른 스텝 가져오기 (localRoutine 사용)
  const getCurrentSteps = (type: RoutineType): RoutineStep[] => {
    switch (type) {
      case 'morning': return localRoutine.morning_steps;
      case 'midday': return localRoutine.midday_steps;
      case 'evening': return localRoutine.evening_steps;
    }
  };

  // 점수 계산 (localRoutine 사용)
  const routineScore = useMemo(() => {
    const getSteps = (type: RoutineType): RoutineStep[] => {
      switch (type) {
        case 'morning': return localRoutine.morning_steps;
        case 'midday': return localRoutine.midday_steps;
        case 'evening': return localRoutine.evening_steps;
      }
    };

    const steps = getSteps(currentRoutineType);
    const scoreSteps: ScoreRoutineStep[] = steps.map(s => ({
      id: s.id_uuid,
      step_type: s.step_type,
      step_order: s.step_order,
      is_enabled: s.is_enabled
    }));
    return calculateRoutineScore(scoreSteps, currentRoutineType);
  }, [localRoutine.morning_steps, localRoutine.midday_steps, localRoutine.evening_steps, currentRoutineType]);

  // 자동 정렬 핸들러
  const handleAutoReorder = () => {
    // 편집 모드 진입
    handleEditPress(currentRoutineType);
  };

  // 편집 모드 진입
  const handleEditPress = (routineType: RoutineType) => {
    setEditingRoutineType(routineType);
    setIsEditMode(true);
    setIsScoreHidden(false); // 편집 시 점수 뱃지 표시
  };

  // 편집 저장 핸들러
  const handleEditSave = async (updatedSteps: EditableStep[]) => {
    console.log('[DEBUG] 💾 Saving edited routine...', updatedSteps);

    if (!editingRoutineType) return;

    setIsEditSaving(true);

    try {
      // API 호출하여 루틴 저장
      const response = await fetch(`/api/skincare/routines/${localRoutine.routine_uuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_of_day: editingRoutineType,
          steps: updatedSteps.map(step => ({
            id_uuid: step.id,  // EditableStep.id는 id_uuid
            step_order: step.step_order,
            step_type: step.step_type,
            step_name: step.step_name,
            recommended_ingredients: step.recommended_ingredients || [],
            recommendation_reason: step.recommendation_reason || ''
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('[DEBUG] ✅ Routine saved successfully:', result);

        // 로컬 상태 업데이트 (서버에서 반환된 스텝으로)
        const newSteps: RoutineStep[] = result.steps.map((s: Record<string, unknown>) => ({
          id_uuid: s.id_uuid as string,  // id_uuid 사용
          step_order: s.step_order,
          step_type: s.step_type,
          step_name: s.step_name,
          recommended_ingredients: s.recommended_ingredients || [],
          recommendation_reason: s.recommendation_reason || '',
          usage_frequency: s.usage_frequency || 'daily',
          is_enabled: s.is_enabled ?? true
        }));

        // 로컬 상태 업데이트 및 localStorage에 저장
        setLocalRoutine(prev => {
          const updated = { ...prev };
          switch (editingRoutineType) {
            case 'morning':
              updated.morning_steps = newSteps;
              break;
            case 'midday':
              updated.midday_steps = newSteps;
              break;
            case 'evening':
              updated.evening_steps = newSteps;
              break;
          }

          // localStorage에도 저장 (새로고침 시 유지되도록)
          mobileStorage.setRaw(
            STORAGE_KEYS.SKINCARE_ROUTINE_DATA,
            JSON.stringify(updated)
          );
          console.log('[DEBUG] 💾 Saved routine to localStorage');

          return updated;
        });

        // 체크 상태는 초기화하지 않음 - id_uuid가 유지되므로 체크 상태도 유지됨
        console.log('[DEBUG] ✅ Step id_uuid preserved, checked state maintained');

        // 편집한 루틴 타입으로 currentRoutineType 변경 (ScoreBadge 점수 갱신)
        setCurrentRoutineType(editingRoutineType);

        // 성공 토스트 표시
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3000);

        setIsEditMode(false);
        setEditingRoutineType(null);
      } else {
        console.error('[DEBUG] ❌ API error:', result.error);
        alert(locale === 'ko' ? '저장 실패: ' + result.error : 'Failed to save: ' + result.error);
      }
    } catch (error) {
      console.error('[DEBUG] ❌ Edit save error:', error);
      alert(locale === 'ko' ? '저장 실패' : 'Failed to save');
    } finally {
      setIsEditSaving(false);
    }
  };

  // 편집 취소 핸들러
  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditingRoutineType(null);
  };

  // 편집할 스텝 가져오기
  const getEditableSteps = (routineType: RoutineType): EditableStep[] => {
    const steps = getCurrentSteps(routineType);
    return steps.map(s => ({
      id: s.id_uuid,  // id_uuid 직접 사용
      step_order: s.step_order,
      step_type: s.step_type,
      step_name: s.step_name,
      recommended_ingredients: s.recommended_ingredients,
      recommendation_reason: s.recommendation_reason,
    }));
  };

  // mobileStorage에서 오늘 날짜의 체크 상태 로드
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const storageKey = STORAGE_KEYS.getRoutineProgressKey(today);
    const saved = mobileStorage.getRaw(storageKey);

    if (saved) {
      setCheckedSteps(new Set(JSON.parse(saved)));
    }

    // 마지막 저장 시간 로드
    const lastSavedTime = mobileStorage.getRaw(STORAGE_KEYS.ROUTINE_LAST_SAVED);
    if (lastSavedTime) {
      setLastSaved(new Date(lastSavedTime));
    }
  }, []);

  // 체크 상태 변경 시 mobileStorage에만 저장 (API 호출 X)
  const handleCheck = (stepId: string) => {
    const newChecked = new Set(checkedSteps);

    if (newChecked.has(stepId)) {
      newChecked.delete(stepId);
    } else {
      newChecked.add(stepId);
    }

    setCheckedSteps(newChecked);

    // mobileStorage에만 저장
    const today = new Date().toISOString().split('T')[0];
    const storageKey = STORAGE_KEYS.getRoutineProgressKey(today);
    mobileStorage.setRaw(storageKey, JSON.stringify(Array.from(newChecked)));
  };

  // 서버에 배치 저장
  const handleSaveToServer = async () => {
    console.log('[DEBUG] 💾 Saving progress to server...');
    setIsSaving(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // 모든 스텝에 대한 진행 상태 생성 (id_uuid + time_of_day)
      type TimeOfDay = 'morning' | 'midday' | 'evening';

      const progress: Array<{
        step_uuid: string;
        time_of_day: TimeOfDay;
        completed: boolean;
        date: string;
      }> = [
        ...localRoutine.morning_steps.map(s => ({
          step_uuid: s.id_uuid,
          time_of_day: 'morning' as TimeOfDay,
          completed: checkedSteps.has(s.id_uuid),
          date: today
        })),
        ...localRoutine.midday_steps.map(s => ({
          step_uuid: s.id_uuid,
          time_of_day: 'midday' as TimeOfDay,
          completed: checkedSteps.has(s.id_uuid),
          date: today
        })),
        ...localRoutine.evening_steps.map(s => ({
          step_uuid: s.id_uuid,
          time_of_day: 'evening' as TimeOfDay,
          completed: checkedSteps.has(s.id_uuid),
          date: today
        }))
      ];

      console.log('[DEBUG] 📤 Sending progress:', { progressCount: progress.length, sample: progress[0] });

      const response = await fetch('/api/skincare/progress/batch-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_uuid_member: localRoutine.id_uuid_member,
          routine_uuid: localRoutine.routine_uuid,
          progress
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('[DEBUG] ✅ Server save success:', result);
        const now = new Date();
        setLastSaved(now);
        mobileStorage.setRaw(STORAGE_KEYS.ROUTINE_LAST_SAVED, now.toISOString());

        // 토스트 표시
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3000);
      } else {
        console.error('[DEBUG] ❌ Server save failed:', result.error);
        alert('Failed to save progress');
      }
    } catch (error) {
      console.error('[DEBUG] ❌ Save error:', error);
      alert('Network error - please try again');
    } finally {
      setIsSaving(false);
    }
  };

  // 진행도 계산 (localRoutine 사용)
  const totalSteps =
    localRoutine.morning_steps.length +
    localRoutine.midday_steps.length +
    localRoutine.evening_steps.length;
  const completedSteps = checkedSteps.size;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // 편집 모드일 때
  if (isEditMode && editingRoutineType) {
    return (
      <RoutineEditor
        initialSteps={getEditableSteps(editingRoutineType)}
        routineType={editingRoutineType}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
        locale={locale}
      />
    );
  }

  return (
    <>
      {/* 스크롤 콘텐츠 */}
      <div className="px-4 py-3 space-y-6 pb-24">
        {/* 진행도 카드 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Today&apos;s Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{progress}%</span>
          </div>

          {/* 진행도 바 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-gray-500">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>

        {/* 주간 요약 */}
        <div className="-mt-4">
          <WeeklySummary
            totalStepsPerDay={totalSteps}
            todayCompletedCount={checkedSteps.size}
          />
        </div>

        {/* 오늘의 팁 */}
        <TodayTip tip="건조한 날씨, 보습 강화!" />

        {/* Morning */}
        <RoutineSection
          title={locale === 'ko' ? '모닝 루틴' : 'Morning Routine'}
          icon="🌅"
          steps={localRoutine.morning_steps}
          checkedSteps={checkedSteps}
          onCheck={handleCheck}
          onEdit={() => handleEditPress('morning')}
          locale={locale}
        />

        {/* Midday */}
        <RoutineSection
          title={locale === 'ko' ? '미드데이 루틴' : 'Midday Routine'}
          icon="☀️"
          steps={localRoutine.midday_steps}
          checkedSteps={checkedSteps}
          onCheck={handleCheck}
          highlight={true}
          onEdit={() => handleEditPress('midday')}
          locale={locale}
        />

        {/* Evening */}
        <RoutineSection
          title={locale === 'ko' ? '이브닝 루틴' : 'Evening Routine'}
          icon="🌙"
          steps={localRoutine.evening_steps}
          checkedSteps={checkedSteps}
          onCheck={handleCheck}
          onEdit={() => handleEditPress('evening')}
          locale={locale}
        />
      </div>

      {/* Fixed 요소들 - 스크롤 영역 밖에 배치 */}
      <button
        onClick={handleSaveToServer}
        disabled={isSaving}
        className="fixed bottom-12 right-6 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 z-50 flex items-center justify-center transition-all"
      >
        {isSaving ? (
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        )}
      </button>

      {/* 저장 완료 토스트 */}
      {showSavedToast && (
        <div className="fixed bottom-24 right-6 bg-green-500 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 animate-fade-in">
          ✓ Saved to server
        </div>
      )}

      {/* 마지막 저장 시간 */}
      {lastSaved && !showSavedToast && (
        <div className="fixed bottom-24 right-6 bg-gray-600 text-white text-xs px-3 py-1 rounded-full opacity-70 z-40">
          Last saved: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {/* 루틴 점수 뱃지 */}
      <ScoreBadge
        score={routineScore.total}
        isHidden={isScoreHidden}
        onToggleHide={() => setIsScoreHidden(!isScoreHidden)}
        onPress={() => setShowScoreDetail(true)}
      />

      {/* 루틴 점수 상세 모달 */}
      <ScoreDetailModal
        isOpen={showScoreDetail}
        onClose={() => setShowScoreDetail(false)}
        score={routineScore}
        routineType={currentRoutineType}
        locale={locale}
        steps={getCurrentSteps(currentRoutineType).map(s => ({
          id: s.id_uuid,
          step_type: s.step_type,
          step_order: s.step_order,
          is_enabled: s.is_enabled
        }))}
        onAutoReorder={handleAutoReorder}
      />
    </>
  );
}

// 루틴 섹션 컴포넌트
interface RoutineSectionProps {
  title: string;
  icon: string;
  steps: RoutineStep[];
  checkedSteps: Set<string>;
  onCheck: (stepId: string) => void;
  highlight?: boolean;
  onEdit?: () => void;
  locale?: string;
}

function RoutineSection({
  title,
  icon,
  steps,
  checkedSteps,
  onCheck,
  highlight = false,
  onEdit,
  locale = 'ko'
}: RoutineSectionProps) {
  if (steps.length === 0) {
    return null;
  }

  const isKo = locale === 'ko';

  return (
    <div>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${
          highlight ? 'text-orange-600' : 'text-gray-900'
        }`}>
          <span>{icon}</span>
          {title}
          {highlight && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              Don&apos;t skip!
            </span>
          )}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isKo ? '편집' : 'Edit'}
          </button>
        )}
      </div>

      {/* 스텝 리스트 */}
      <div className="space-y-3">
        {steps.map((step) => {
          const stepId = step.id_uuid;
          const isChecked = checkedSteps.has(stepId);

          return (
            <label
              key={stepId}
              className={`
                flex items-start p-4 bg-white rounded-xl border-2
                cursor-pointer transition-all
                ${isChecked
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              {/* 체크박스 */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onCheck(stepId)}
                className="
                  w-6 h-6 rounded-md border-2 border-gray-300
                  text-green-600 focus:ring-2 focus:ring-blue-500
                  cursor-pointer flex-shrink-0 mt-0.5
                "
              />

              {/* 스텝 정보 */}
              <div className="ml-3 flex-1">
                <div className={`font-semibold text-base ${
                  isChecked ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {step.step_name}
                </div>

                <div className="text-xs text-gray-500 mt-0.5">
                  {step.step_type}
                </div>

                {step.recommended_ingredients && step.recommended_ingredients.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.recommended_ingredients.join(', ')}
                  </div>
                )}

                {step.recommendation_reason && (
                  <div className="text-xs text-blue-600 mt-1 flex items-start">
                    <span className="mr-1 flex-shrink-0">💡</span>
                    <span>{step.recommendation_reason}</span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// 오늘의 팁 컴포넌트
interface TodayTipProps {
  tip: string;
}

function TodayTip({ tip }: TodayTipProps) {
  return (
    <div className="-mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-amber-800">오늘의 팁</span>
      </div>
      <p className="text-sm text-amber-700 mt-1 flex items-center gap-1.5">
        <span>💡</span>
        <span>{tip}</span>
      </p>
    </div>
  );
}
