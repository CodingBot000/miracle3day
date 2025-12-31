'use client';

import { useEffect, useState } from 'react';

interface RoutineStep {
  id: number;
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
  user_uuid: string;
  morning_steps: RoutineStep[];
  midday_steps: RoutineStep[];
  evening_steps: RoutineStep[];
}

interface TodayTabProps {
  routine: RoutineData;
}

export default function TodayTab({ routine }: TodayTabProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // 로컬스토리지에서 오늘 날짜의 체크 상태 로드
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const storageKey = `routine_progress_${today}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      setCheckedSteps(new Set(JSON.parse(saved)));
    }

    // 마지막 저장 시간 로드
    const lastSavedTime = localStorage.getItem('routine_last_saved');
    if (lastSavedTime) {
      setLastSaved(new Date(lastSavedTime));
    }
  }, []);

  // 체크 상태 변경 시 localStorage에만 저장 (API 호출 X)
  const handleCheck = (stepId: string) => {
    const newChecked = new Set(checkedSteps);

    if (newChecked.has(stepId)) {
      newChecked.delete(stepId);
    } else {
      newChecked.add(stepId);
    }

    setCheckedSteps(newChecked);

    // localStorage에만 저장
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `routine_progress_${today}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newChecked)));
  };

  // 서버에 배치 저장
  const handleSaveToServer = async () => {
    console.log('[DEBUG] 💾 Saving progress to server...');
    setIsSaving(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // 모든 스텝에 대한 진행 상태 생성
      const allSteps = [
        ...routine.morning_steps.map(s => `morning-${s.id}`),
        ...routine.midday_steps.map(s => `midday-${s.id}`),
        ...routine.evening_steps.map(s => `evening-${s.id}`)
      ];

      const progress = allSteps.map(stepId => ({
        step_id: stepId,
        completed: checkedSteps.has(stepId),
        date: today
      }));

      const response = await fetch('/api/skincare/progress/batch-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_uuid: routine.user_uuid,
          routine_uuid: routine.routine_uuid,
          progress
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('[DEBUG] ✅ Server save success:', result);
        const now = new Date();
        setLastSaved(now);
        localStorage.setItem('routine_last_saved', now.toISOString());

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

  // 진행도 계산
  const totalSteps =
    routine.morning_steps.length +
    routine.midday_steps.length +
    routine.evening_steps.length;
  const completedSteps = checkedSteps.size;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="p-4 space-y-6 pb-24">
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

      {/* Morning */}
      <RoutineSection
        title="Morning Routine"
        icon="🌅"
        steps={routine.morning_steps}
        checkedSteps={checkedSteps}
        onCheck={handleCheck}
        timePrefix="morning"
      />

      {/* Midday */}
      <RoutineSection
        title="Midday Routine"
        icon="☀️"
        steps={routine.midday_steps}
        checkedSteps={checkedSteps}
        onCheck={handleCheck}
        timePrefix="midday"
        highlight={true}
      />

      {/* Evening */}
      <RoutineSection
        title="Evening Routine"
        icon="🌙"
        steps={routine.evening_steps}
        checkedSteps={checkedSteps}
        onCheck={handleCheck}
        timePrefix="evening"
      />

      {/* 플로팅 저장 버튼 */}
      <button
        onClick={handleSaveToServer}
        disabled={isSaving}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 z-50 flex items-center justify-center transition-all"
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
    </div>
  );
}

// 루틴 섹션 컴포넌트
interface RoutineSectionProps {
  title: string;
  icon: string;
  steps: RoutineStep[];
  checkedSteps: Set<string>;
  onCheck: (stepId: string) => void;
  timePrefix: 'morning' | 'midday' | 'evening';
  highlight?: boolean;
}

function RoutineSection({
  title,
  icon,
  steps,
  checkedSteps,
  onCheck,
  timePrefix,
  highlight = false
}: RoutineSectionProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div>
      {/* 섹션 헤더 */}
      <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
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

      {/* 스텝 리스트 */}
      <div className="space-y-3">
        {steps.map((step) => {
          const stepId = `${timePrefix}-${step.id}`;
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
