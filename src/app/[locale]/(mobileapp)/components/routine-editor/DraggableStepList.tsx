'use client';

import {
  DndContext,
  closestCenter,
  TouchSensor,
  MouseSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DraggableStepItem, { EditableStep } from './DraggableStepItem';

interface DraggableStepListProps {
  steps: EditableStep[];
  onReorder: (steps: EditableStep[]) => void;
  onDelete: (id: string) => void;
  requiredStepTypes: string[];
  locale?: string;
}

export default function DraggableStepList({
  steps,
  onReorder,
  onDelete,
  requiredStepTypes,
  locale = 'ko'
}: DraggableStepListProps) {
  // 센서 설정 - 마우스/키보드/터치 모두 지원
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px 이동해야 드래그 시작
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over.id);

      const reorderedSteps = arrayMove(steps, oldIndex, newIndex).map(
        (step, index) => ({
          ...step,
          step_order: index + 1,
        })
      );

      onReorder(reorderedSteps);
    }
  };

  const isRequired = (stepType: string) => requiredStepTypes.includes(stepType);

  const isKo = locale === 'ko';

  return (
    <div className="space-y-2">
      {/* 드래그 힌트 */}
      <p className="text-xs text-gray-500 text-center mb-3">
        {isKo ? '드래그하여 순서 변경' : 'Drag to reorder'}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((step) => step.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {steps.map((step, index) => (
              <DraggableStepItem
                key={step.id}
                step={step}
                index={index}
                onDelete={onDelete}
                isRequired={isRequired(step.step_type)}
                locale={locale}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {isKo ? '스텝이 없습니다. 스텝을 추가해 주세요.' : 'No steps. Please add a step.'}
        </div>
      )}
    </div>
  );
}
