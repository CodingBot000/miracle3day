'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface EditableStep {
  id: string;
  step_order: number;
  step_type: string;
  step_name: string;
  recommended_ingredients?: string[];
  recommendation_reason?: string;
  required?: boolean;
  product_name?: string;
}

interface DraggableStepItemProps {
  step: EditableStep;
  index: number;
  onDelete: (id: string) => void;
  isRequired: boolean;
  locale?: string;
}

const STEP_ICONS: Record<string, string> = {
  cleanser: '🧴',
  toner: '💧',
  essence: '✨',
  serum: '💎',
  eye_cream: '👁️',
  moisturizer: '🧴',
  facial_oil: '🫒',
  sunscreen: '☀️',
  mask: '🎭',
  exfoliant: '🧽',
  mist: '💨',
  treatment: '💊',
  sleeping_mask: '😴',
  lip_care: '💋',
  blotting_paper: '📄',
};

const STEP_NAMES_KO: Record<string, string> = {
  cleanser: '클렌저',
  toner: '토너',
  essence: '에센스',
  serum: '세럼',
  eye_cream: '아이크림',
  moisturizer: '모이스처라이저',
  facial_oil: '페이스 오일',
  sunscreen: '선케어',
  mask: '마스크',
  exfoliant: '각질제거',
  mist: '미스트',
  treatment: '트리트먼트',
  sleeping_mask: '슬리핑 마스크',
  lip_care: '립케어',
  blotting_paper: '기름종이',
};

export default function DraggableStepItem({
  step,
  index,
  onDelete,
  isRequired,
  locale = 'en'
}: DraggableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isKo = locale === 'ko';
  const stepDisplayName = isKo
    ? STEP_NAMES_KO[step.step_type] || step.step_type
    : step.step_type.replace('_', ' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-xl border-2 overflow-hidden
        ${isDragging
          ? 'border-blue-500 shadow-lg opacity-90 z-50'
          : 'border-gray-200'
        }
      `}
    >
      <div className="flex items-center p-3 gap-3">
        {/* 드래그 핸들 */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 -ml-1"
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>

        {/* 순서 번호 */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-600">{index + 1}</span>
        </div>

        {/* 아이콘 */}
        <span className="text-lg flex-shrink-0">
          {STEP_ICONS[step.step_type] || '📦'}
        </span>

        {/* 스텝 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {stepDisplayName}
            </span>
            {isRequired && (
              <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-blue-100 text-white rounded font-medium">
                {isKo ? '필수' : 'Required'}
              </span>
            )}
          </div>
          {step.product_name && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {step.product_name}
            </p>
          )}
        </div>

        {/* 삭제 버튼 (필수 아닌 경우만) */}
        {!isRequired && (
          <button
            onClick={() => onDelete(step.id)}
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
            aria-label={isKo ? '삭제' : 'Delete'}
          >
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
