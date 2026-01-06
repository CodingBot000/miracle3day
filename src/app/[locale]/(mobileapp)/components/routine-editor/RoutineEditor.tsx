'use client';

import { useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DraggableStepList from './DraggableStepList';
import AddStepModal from './AddStepModal';
import EditModeToolbar from './EditModeToolbar';
import { EditableStep } from './DraggableStepItem';
import {
  calculateRoutineScore,
  RoutineType,
  RoutineStep as ScoreRoutineStep,
  STEP_ORDER_MAP
} from '@/lib/skincare/routineScoreCalculator';

interface RoutineEditorProps {
  initialSteps: EditableStep[];
  routineType: RoutineType;
  onSave: (updatedSteps: EditableStep[]) => void;
  onCancel: () => void;
  locale?: string;
}

// 필수 스텝 타입 정의
const REQUIRED_STEP_TYPES: Record<RoutineType, string[]> = {
  morning: ['cleanser', 'moisturizer', 'sunscreen'],
  midday: ['sunscreen'],
  evening: ['cleanser', 'moisturizer'],
};

// 스텝 타입별 기본 이름
const DEFAULT_STEP_NAMES: Record<string, { ko: string; en: string }> = {
  cleanser: { ko: '클렌저', en: 'Cleanser' },
  toner: { ko: '토너', en: 'Toner' },
  essence: { ko: '에센스', en: 'Essence' },
  serum: { ko: '세럼', en: 'Serum' },
  eye_cream: { ko: '아이크림', en: 'Eye Cream' },
  moisturizer: { ko: '모이스처라이저', en: 'Moisturizer' },
  facial_oil: { ko: '페이스 오일', en: 'Face Oil' },
  sunscreen: { ko: '선케어', en: 'Sunscreen' },
  mask: { ko: '마스크', en: 'Mask' },
  exfoliant: { ko: '각질제거', en: 'Exfoliant' },
  mist: { ko: '미스트', en: 'Mist' },
  treatment: { ko: '트리트먼트', en: 'Treatment' },
  sleeping_mask: { ko: '슬리핑 마스크', en: 'Sleeping Mask' },
  lip_care: { ko: '립케어', en: 'Lip Care' },
  blotting_paper: { ko: '기름종이', en: 'Blotting Paper' },
};

export default function RoutineEditor({
  initialSteps,
  routineType,
  onSave,
  onCancel,
  locale = 'ko'
}: RoutineEditorProps) {
  const [steps, setSteps] = useState<EditableStep[]>(initialSteps);
  const [showAddModal, setShowAddModal] = useState(false);
  const isKo = locale === 'ko';

  // 변경사항 확인
  const hasChanges = useMemo(() => {
    if (steps.length !== initialSteps.length) return true;
    return steps.some((step, index) => {
      const initial = initialSteps[index];
      return (
        step.id !== initial.id ||
        step.step_type !== initial.step_type ||
        step.step_order !== initial.step_order
      );
    });
  }, [steps, initialSteps]);

  // 점수 계산
  const currentScore = useMemo(() => {
    const scoreSteps: ScoreRoutineStep[] = steps.map(s => ({
      id: s.id,
      step_type: s.step_type,
      step_order: s.step_order,
      is_enabled: true
    }));
    return calculateRoutineScore(scoreSteps, routineType);
  }, [steps, routineType]);

  // 순서 변경
  const handleReorder = useCallback((reorderedSteps: EditableStep[]) => {
    setSteps(reorderedSteps);
  }, []);

  // 스텝 삭제
  const handleDelete = useCallback((id: string) => {
    setSteps(prev => {
      const filtered = prev.filter(step => step.id !== id);
      return filtered.map((step, index) => ({
        ...step,
        step_order: index + 1
      }));
    });
  }, []);

  // 스텝 추가
  const handleAddStep = useCallback((stepType: string) => {
    const newStep: EditableStep = {
      id: uuidv4(),
      step_order: steps.length + 1,
      step_type: stepType,
      step_name: DEFAULT_STEP_NAMES[stepType]?.[isKo ? 'ko' : 'en'] || stepType,
    };
    setSteps(prev => [...prev, newStep]);
  }, [steps.length, isKo]);

  // 자동 정렬
  const handleAutoSort = useCallback(() => {
    const sorted = [...steps]
      .sort((a, b) => {
        const orderA = STEP_ORDER_MAP[a.step_type] ?? 999;
        const orderB = STEP_ORDER_MAP[b.step_type] ?? 999;
        return orderA - orderB;
      })
      .map((step, index) => ({
        ...step,
        step_order: index + 1,
      }));
    setSteps(sorted);
  }, [steps]);

  // 저장
  const handleSave = useCallback(() => {
    onSave(steps);
  }, [steps, onSave]);

  // 취소 (변경사항이 있으면 확인)
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm(
        isKo
          ? '저장하지 않은 변경사항이 있어요. 나가시겠어요?'
          : 'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }
    onCancel();
  }, [hasChanges, isKo, onCancel]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 툴바 */}
      <EditModeToolbar
        score={currentScore.total}
        hasChanges={hasChanges}
        onCancel={handleCancel}
        onAutoSort={handleAutoSort}
        onSave={handleSave}
        onAddStep={() => setShowAddModal(true)}
        locale={locale}
      />

      {/* 스텝 리스트 */}
      <div className="px-4 py-4">
        <DraggableStepList
          steps={steps}
          onReorder={handleReorder}
          onDelete={handleDelete}
          requiredStepTypes={REQUIRED_STEP_TYPES[routineType]}
          locale={locale}
        />
      </div>

      {/* 스텝 추가 모달 */}
      <AddStepModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStep}
        locale={locale}
      />
    </div>
  );
}
